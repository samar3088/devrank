<?php

namespace App\Services;

use App\Models\Quiz;
use App\Models\Tag;
use Illuminate\Support\Facades\DB;

/**
 * Skill paths (#9) — closes the loop between assessment and improvement. For a
 * candidate it surfaces, per skill (tag), where they stand and the concrete next
 * actions that raise their rank: quizzes they haven't taken and open forum
 * questions they could answer. Built entirely from existing content — no
 * hand-authored curriculum.
 */
class SkillPathService
{
    /**
     * @return array<int, array> paths, each: tag + standing + next actions.
     */
    public function forCandidate(int $userId, int $limit = 4): array
    {
        // 1. Skills the candidate already has traction in (with their tag rank).
        $engaged = app(TagRankingService::class)->forCandidate($userId, 12);
        $standingByTag = collect($engaged)->keyBy('tag_id');
        $engagedIds = $standingByTag->keys()->all();

        // 2. Quizzes the candidate has already attempted (to recommend the rest).
        $attemptedQuizIds = DB::table('quiz_attempts')->where('user_id', $userId)->pluck('quiz_id')->all();

        // 3. Candidate pool: engaged skills where they aren't #1 (room to climb),
        //    plus top skills that actually have content they haven't engaged with.
        $climb = collect($engaged)->filter(fn ($t) => $t['rank'] > 1)->pluck('tag_id');

        $contentTagIds = Quiz::where('status', 'published')->whereNotNull('tag_id')
            ->pluck('tag_id')->unique();
        $newSkills = $contentTagIds->reject(fn ($id) => in_array($id, $engagedIds))->take(6);

        $tagIds = $climb->merge($newSkills)->unique()->take($limit + 2)->values();

        if ($tagIds->isEmpty()) {
            // Cold start — recommend the busiest skills that have quizzes.
            $tagIds = $contentTagIds->take($limit)->values();
        }

        $tags = Tag::whereIn('id', $tagIds)->get(['id', 'name', 'slug'])->keyBy('id');

        $paths = [];
        foreach ($tagIds as $tagId) {
            $tag = $tags->get($tagId);
            if (! $tag) {
                continue;
            }

            $quizzes = Quiz::where('status', 'published')
                ->where('tag_id', $tagId)
                ->whereNotIn('id', $attemptedQuizIds)
                ->limit(3)
                ->get(['id', 'title', 'slug', 'difficulty'])
                ->map(fn ($q) => [
                    'title'      => $q->title,
                    'slug'       => $q->slug,
                    'difficulty' => $q->difficulty,
                ])->all();

            $openTopics = $this->unansweredTopicCount($userId, $tagId);

            // Skip a skill that offers no actionable next step.
            if (empty($quizzes) && $openTopics === 0) {
                continue;
            }

            $standing = $standingByTag->get($tagId);

            $paths[] = [
                'tag_id'       => $tagId,
                'tag_name'     => $tag->name,
                'tag_slug'     => $tag->slug,
                'standing'     => $standing ? "Ranked #{$standing['rank']}" : 'Not started',
                'focus'        => $standing ? 'climb' : 'new',
                'quizzes'      => $quizzes,
                'open_topics'  => $openTopics,
            ];

            if (count($paths) >= $limit) {
                break;
            }
        }

        return $paths;
    }

    /** Topics in a tag the candidate hasn't replied to yet (answer opportunities). */
    private function unansweredTopicCount(int $userId, int $tagId): int
    {
        return DB::table('topics')
            ->join('topic_tag', 'topics.id', '=', 'topic_tag.topic_id')
            ->where('topic_tag.tag_id', $tagId)
            ->where('topics.status', 'open')
            ->whereNull('topics.deleted_at')
            ->whereNotExists(function ($q) use ($userId) {
                $q->select(DB::raw(1))->from('replies')
                    ->whereColumn('replies.topic_id', 'topics.id')
                    ->where('replies.user_id', $userId);
            })
            ->distinct('topics.id')
            ->count('topics.id');
    }
}
