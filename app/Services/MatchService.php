<?php

namespace App\Services;

use App\Models\JobListing;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Two-sided match scoring (#4). A single 0–100 score blends skill overlap,
 * rank, experience and preferences so discovery is active (ranked matches)
 * rather than manual browsing. Pure read model — no side effects.
 */
class MatchService
{
    // Blend weights (sum = 1.0).
    private const W_SKILL = 0.50;
    private const W_RANK  = 0.25;
    private const W_EXP   = 0.15;
    private const W_PREF  = 0.10;

    private const EXP_LEVELS = ['junior' => 1, 'mid' => 2, 'senior' => 3, 'lead' => 4, 'principal' => 5];

    /** Distinct approved tag ids a candidate has demonstrated skill in (forum activity). */
    public function candidateTagIds(int $userId): array
    {
        return DB::table('replies')
            ->join('topics', 'replies.topic_id', '=', 'topics.id')
            ->join('topic_tag', 'topics.id', '=', 'topic_tag.topic_id')
            ->where('replies.user_id', $userId)
            ->where('replies.status', 'visible')
            ->whereNull('replies.deleted_at')
            ->distinct()
            ->pluck('topic_tag.tag_id')
            ->all();
    }

    /** Distinct tag ids a candidate has been TESTED on (completed quiz attempts). */
    public function candidateQuizTagIds(int $userId): array
    {
        return DB::table('quiz_attempts')
            ->join('quizzes', 'quiz_attempts.quiz_id', '=', 'quizzes.id')
            ->where('quiz_attempts.user_id', $userId)
            ->where('quiz_attempts.status', 'completed')
            ->whereNotNull('quizzes.tag_id')
            ->distinct()
            ->pluck('quizzes.tag_id')
            ->all();
    }

    /**
     * A candidate's full demonstrated-skill tag set: forum activity ∪ tests taken.
     * This is the skill signal used for matching (declared headline text is too
     * noisy to use structurally).
     */
    public function candidateSkillTagIds(int $userId): array
    {
        return array_values(array_unique(array_merge(
            $this->candidateTagIds($userId),
            $this->candidateQuizTagIds($userId),
        )));
    }

    /** Highest total_rank_score among candidates (for normalising rank fit). */
    private function topScore(): int
    {
        return (int) max(1, User::role('candidate')->max('total_rank_score'));
    }

    /**
     * Score one candidate against one job (0–100). Pass precomputed data to keep
     * batch scoring cheap.
     */
    public function scoreJobCandidate(JobListing $job, User $candidate, ?array $candidateTags = null, ?array $jobTags = null, ?int $topScore = null): int
    {
        $candidateTags ??= $this->candidateTagIds($candidate->id);
        $jobTags ??= $job->tags->pluck('id')->all();
        $topScore ??= $this->topScore();

        // Skill overlap — share of the job's tags the candidate has demonstrated.
        if (empty($jobTags)) {
            $skill = 0.5; // untagged job → neutral
        } else {
            $overlap = count(array_intersect($jobTags, $candidateTags));
            $skill = $overlap / count($jobTags);
        }

        // Rank fit — normalised earned score.
        $rank = min(1, $candidate->total_rank_score / $topScore);

        // Experience fit — closeness of levels (1.0 exact, decaying with distance).
        $exp = 0.6; // neutral when either side is unspecified
        $jl = self::EXP_LEVELS[$job->experience_level] ?? null;
        $cl = self::EXP_LEVELS[$candidate->experience_level] ?? null;
        if ($jl !== null && $cl !== null) {
            $exp = max(0, 1 - abs($jl - $cl) / 4);
        }

        // Preference fit — work mode / job type / location signals.
        $pref = $this->preferenceFit($job, $candidate);

        $score = self::W_SKILL * $skill
               + self::W_RANK  * $rank
               + self::W_EXP   * $exp
               + self::W_PREF  * $pref;

        return (int) round($score * 100);
    }

    private function preferenceFit(JobListing $job, User $candidate): float
    {
        $signals = [];

        if ($candidate->preferred_job_type) {
            $signals[] = strcasecmp($candidate->preferred_job_type, (string) $job->job_type) === 0 ? 1 : 0;
        }
        if ($candidate->preferred_location && $job->location) {
            $signals[] = stripos($job->location, $candidate->preferred_location) !== false
                || stripos($candidate->preferred_location, $job->location) !== false ? 1 : 0;
        }
        // Remote jobs suit everyone.
        if ($job->work_mode === 'remote') {
            $signals[] = 1;
        }

        return empty($signals) ? 0.6 : array_sum($signals) / count($signals);
    }

    /** Active jobs ranked by match for a candidate. Returns [['job'=>, 'score'=>], …]. */
    public function jobsForCandidate(User $candidate, int $limit = 6): array
    {
        $candTags = $this->candidateSkillTagIds($candidate->id);
        $top = $this->topScore();

        // Bound the working set (most recent active jobs) so scoring stays cheap
        // on the candidate dashboard even as the board grows.
        $jobs = JobListing::with(['tags:id,name,slug', 'company:id,name,company_name,trust_score'])
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->latest('published_at')
            ->limit(200)
            ->get();

        return $jobs->map(fn ($job) => [
                'job'   => $job,
                'score' => $this->scoreJobCandidate($job, $candidate, $candTags, $job->tags->pluck('id')->all(), $top),
            ])
            ->sortByDesc('score')
            ->take($limit)
            ->values()
            ->all();
    }

    /** open_to_work candidates ranked by match to a specific job. */
    public function candidatesForJob(JobListing $job, int $limit = 12): array
    {
        $jobTags = $job->tags->pluck('id')->all();
        $top = $this->topScore();

        // Bound the pool to the strongest open-to-work candidates so Browse
        // Talent scoring stays cheap; top-12 surfaces from here regardless.
        $candidates = User::role('candidate')
            ->where('is_active', true)
            ->where('open_to_work', true)
            ->orderByDesc('total_rank_score')
            ->limit(300)
            ->get();

        $tagMap = $this->candidateTagMap($candidates->pluck('id')->all());

        return $candidates
            ->map(fn ($cand) => [
                'candidate' => $cand,
                'score'     => $this->scoreJobCandidate($job, $cand, $tagMap[$cand->id] ?? [], $jobTags, $top),
            ])
            ->sortByDesc('score')
            ->take($limit)
            ->values()
            ->all();
    }

    /**
     * Combined skill tag ids per candidate (forum activity ∪ tests taken) in two
     * queries — avoids N+1 in batch scoring and matches candidateSkillTagIds().
     */
    public function candidateTagMap(array $userIds): array
    {
        if (empty($userIds)) {
            return [];
        }

        $forum = DB::table('replies')
            ->join('topics', 'replies.topic_id', '=', 'topics.id')
            ->join('topic_tag', 'topics.id', '=', 'topic_tag.topic_id')
            ->whereIn('replies.user_id', $userIds)
            ->where('replies.status', 'visible')
            ->whereNull('replies.deleted_at')
            ->select('replies.user_id', 'topic_tag.tag_id')
            ->distinct()
            ->get();

        $quiz = DB::table('quiz_attempts')
            ->join('quizzes', 'quiz_attempts.quiz_id', '=', 'quizzes.id')
            ->whereIn('quiz_attempts.user_id', $userIds)
            ->where('quiz_attempts.status', 'completed')
            ->whereNotNull('quizzes.tag_id')
            ->select('quiz_attempts.user_id', 'quizzes.tag_id')
            ->distinct()
            ->get();

        return $forum->concat($quiz)
            ->groupBy('user_id')
            ->map(fn ($rows) => array_values(array_unique($rows->pluck('tag_id')->all())))
            ->all();
    }
}
