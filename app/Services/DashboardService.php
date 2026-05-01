<?php

namespace App\Services;

use App\Models\JobApplication;
use App\Models\JobListing;
use App\Models\QuizAttempt;
use App\Models\Reply;
use App\Models\Tag;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    // ── Route to correct dashboard view ─────────────────────────
    public function getDashboardView(User $user): string
    {
        if ($user->hasRole('company')) {
            return 'Dashboard/CompanyDashboard';
        }

        return 'Dashboard/CandidateDashboard';
    }

    // ── Candidate stats ──────────────────────────────────────────
    public function getCandidateStats(User $user): array
    {
        // Forum stats
        $totalReplies     = $user->replies()->where('status', 'visible')->count();
        $totalTopics      = $user->topics()->count();
        $totalLikes       = (int) $user->replies()->where('status', 'visible')->sum('likes_count');
        $acceptedAnswers  = $user->replies()->where('is_accepted', true)->count();

        // Global rank position
        $rankPosition = User::role('candidate')
            ->where('total_rank_score', '>', $user->total_rank_score)
            ->count() + 1;

        // Total candidates for rank context
        $totalCandidates = User::role('candidate')->count();

        // Top tag rankings — likes on replies grouped by tag
        $tagRankings = $this->getCandidateTagRankings($user->id);

        // Quiz stats
        $quizAttempts   = QuizAttempt::where('user_id', $user->id)->where('status', 'completed')->count();
        $quizzesPassed  = QuizAttempt::where('user_id', $user->id)->where('status', 'completed')->where('passed', true)->count();
        $totalQuizPts   = QuizAttempt::where('user_id', $user->id)->where('status', 'completed')->sum('rank_points_awarded');

        // Job applications
        $totalApplications = $user->jobApplications()->count();
        $pendingApplications = $user->jobApplications()
            ->whereIn('status', ['applied', 'reviewing'])->count();
        $monthlyAppRemaining = max(0,
            config('devrank.candidate_apply_limit', 5) - $user->monthly_job_applications
        );

        // Interest requests
        $interestsPending  = $user->receivedInterests()->where('status', 'pending')->count();
        $interestsAccepted = $user->receivedInterests()->where('status', 'accepted')->count();

        // Profile views (how many companies viewed)
        $profileViews = \App\Models\ProfileViewLog::where('profile_id', $user->id)->count();

        // Weekly rank score history (last 8 weeks)
        // We track score snapshots — if no snapshot table, we estimate from attempts
        $weeklyHistory = $this->getWeeklyRankHistory($user->id, $user->total_rank_score);

        // Pending actions — quizzes not yet taken
        $untakenQuizCount = \App\Models\Quiz::published()
            ->whereNotIn('id', QuizAttempt::where('user_id', $user->id)->pluck('quiz_id'))
            ->count();

        return [
            // Rank
            'rank_score'          => $user->total_rank_score,
            'human_score'         => $user->human_score ?? 0,
            'rank_position'       => $rankPosition,
            'total_candidates'    => $totalCandidates,
            'rank_percentile'     => $totalCandidates > 0
                ? round((1 - ($rankPosition / $totalCandidates)) * 100)
                : 0,

            // Forum
            'total_replies'       => $totalReplies,
            'total_topics'        => $totalTopics,
            'total_likes'         => $totalLikes,
            'accepted_answers'    => $acceptedAnswers,

            // Tag rankings
            'tag_rankings'        => $tagRankings,

            // Quiz
            'quiz_attempts'       => $quizAttempts,
            'quizzes_passed'      => $quizzesPassed,
            'total_quiz_points'   => $totalQuizPts,

            // Applications
            'total_applications'       => $totalApplications,
            'pending_applications'     => $pendingApplications,
            'monthly_app_remaining'    => $monthlyAppRemaining,

            // Interests / outreach
            'interests_pending'   => $interestsPending,
            'interests_accepted'  => $interestsAccepted,
            'profile_views'       => $profileViews,

            // Chart
            'weekly_history'      => $weeklyHistory,

            // Pending actions
            'untaken_quiz_count'  => $untakenQuizCount,
        ];
    }

    // ── Company stats ────────────────────────────────────────────
    public function getCompanyStats(User $user): array
    {
        $jobIds = $user->jobListings()->pluck('id');

        return [
            'total_jobs'               => $user->jobListings()->count(),
            'active_jobs'              => $user->jobListings()->where('status', 'active')->count(),
            'total_applications'       => JobApplication::whereIn('jobs_listing_id', $jobIds)->count(),
            'new_applications'         => JobApplication::whereIn('jobs_listing_id', $jobIds)
                                            ->where('status', 'applied')
                                            ->count(),
            'interests_sent'           => $user->sentInterests()->count(),
            'interests_accepted'       => $user->sentInterests()->where('status', 'accepted')->count(),
            'monthly_posts_remaining'  => max(0,
                config('devrank.company_job_limit', 5) - $user->monthly_job_posts
            ),
            'monthly_interest_remaining' => max(0,
                config('devrank.company_interest_limit', 10) - $user->monthly_outreach_sent
            ),
            // Pipeline stages
            'pipeline' => [
                'applied'     => JobApplication::whereIn('jobs_listing_id', $jobIds)->where('status', 'applied')->count(),
                'reviewing'   => JobApplication::whereIn('jobs_listing_id', $jobIds)->where('status', 'reviewing')->count(),
                'shortlisted' => JobApplication::whereIn('jobs_listing_id', $jobIds)->where('status', 'shortlisted')->count(),
                'interview'   => JobApplication::whereIn('jobs_listing_id', $jobIds)->where('status', 'interview')->count(),
                'offered'     => JobApplication::whereIn('jobs_listing_id', $jobIds)->where('status', 'offered')->count(),
            ],
        ];
    }

    // ── Tag rankings for a candidate ────────────────────────────
    /**
     * For each tag the candidate has answered in:
     * - Count their likes on replies in topics tagged with that tag
     * - Rank them against other candidates in the same tag
     */
    public function getCandidateTagRankings(int $userId, int $limit = 6): array
    {
        // Get candidate's likes-per-tag
        $myTagScores = DB::table('replies')
            ->join('topics', 'replies.topic_id', '=', 'topics.id')
            ->join('topic_tag', 'topics.id', '=', 'topic_tag.topic_id')
            ->join('tags', 'topic_tag.tag_id', '=', 'tags.id')
            ->where('replies.user_id', $userId)
            ->where('replies.status', 'visible')
            ->whereNull('replies.deleted_at')
            ->where('tags.status', 'approved')
            ->select('tags.id as tag_id', 'tags.name as tag_name', 'tags.slug as tag_slug',
                     DB::raw('SUM(replies.likes_count) as total_likes'))
            ->groupBy('tags.id', 'tags.name', 'tags.slug')
            ->orderByDesc('total_likes')
            ->limit($limit)
            ->get();

        if ($myTagScores->isEmpty()) return [];

        // For each tag, count how many candidates have MORE likes than this candidate
        return $myTagScores->map(function ($tag) use ($userId) {
            $rank = DB::table('replies')
                ->join('topics', 'replies.topic_id', '=', 'topics.id')
                ->join('topic_tag', 'topics.id', '=', 'topic_tag.topic_id')
                ->where('topic_tag.tag_id', $tag->tag_id)
                ->where('replies.status', 'visible')
                ->whereNull('replies.deleted_at')
                ->where('replies.user_id', '!=', $userId)
                ->select('replies.user_id', DB::raw('SUM(replies.likes_count) as total_likes'))
                ->groupBy('replies.user_id')
                ->having('total_likes', '>', $tag->total_likes)
                ->count() + 1;

            return [
                'tag_id'      => $tag->tag_id,
                'tag_name'    => $tag->tag_name,
                'tag_slug'    => $tag->tag_slug,
                'total_likes' => (int) $tag->total_likes,
                'rank'        => $rank,
            ];
        })->toArray();
    }

    // ── Weekly rank score history ────────────────────────────────
    /**
     * Builds an approximate 8-week history from quiz_attempts and replies.
     * Since we don't have a dedicated rank_snapshots table (future enhancement),
     * we reconstruct by summing points earned each week back from current score.
     */
    private function getWeeklyRankHistory(int $userId, int $currentScore): array
    {
        // Points earned per week (quiz attempts + estimated forum likes)
        $weeklyQuizPts = DB::table('quiz_attempts')
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subWeeks(8))
            ->select(
                DB::raw('YEARWEEK(completed_at, 1) as yw'),
                DB::raw('SUM(rank_points_awarded) as pts')
            )
            ->groupBy('yw')
            ->orderBy('yw')
            ->pluck('pts', 'yw');

        // Build 8-week array (most recent last)
        $weeks  = [];
        $labels = [];

        for ($i = 7; $i >= 0; $i--) {
            $date  = now()->subWeeks($i);
            $yw    = $date->format('oW'); // ISO year+week
            $weeks[$yw] = $weeklyQuizPts[$yw] ?? 0;
            $labels[]   = $date->format('M d');
        }

        // Reconstruct cumulative history ending at currentScore
        $totalTracked = array_sum($weeks);
        $baseScore    = max(0, $currentScore - $totalTracked);

        $history    = [];
        $running    = $baseScore;
        $weekKeys   = array_keys($weeks);

        foreach ($weekKeys as $i => $yw) {
            $running   += $weeks[$yw];
            $history[] = [
                'label' => $labels[$i],
                'score' => $running,
            ];
        }

        return $history;
    }
}