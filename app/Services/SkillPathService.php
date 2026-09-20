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

        // Recommendable quizzes (not yet attempted) for ALL candidate tags in one
        // query — whereDoesntHave avoids pulling every attempted quiz_id into PHP,
        // grouped by tag so we don't re-query per tag in the loop below.
        $quizzesByTag = Quiz::where('status', 'published')
            ->whereIn('tag_id', $tagIds)
            ->whereDoesntHave('attempts', fn ($q) => $q->where('user_id', $userId))
            ->get(['id', 'title', 'slug', 'difficulty', 'tag_id'])
            ->groupBy('tag_id');

        // Answer-opportunity counts for ALL candidate tags in one grouped query.
        $openTopicsByTag = $this->unansweredTopicCounts($userId, $tagIds);

        $paths = [];
        foreach ($tagIds as $tagId) {
            $tag = $tags->get($tagId);
            if (! $tag) {
                continue;
            }

            $quizzes = ($quizzesByTag[$tagId] ?? collect())
                ->take(3)
                ->map(fn ($q) => [
                    'title'      => $q->title,
                    'slug'       => $q->slug,
                    'difficulty' => $q->difficulty,
                ])->values()->all();

            $openTopics = (int) ($openTopicsByTag[$tagId] ?? 0);

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

    /**
     * Open-topic answer-opportunity counts per tag (topics the candidate hasn't
     * replied to), for a set of tags in ONE grouped query. Returns [tag_id => count].
     */
    private function unansweredTopicCounts(int $userId, $tagIds): \Illuminate\Support\Collection
    {
        return DB::table('topics')
            ->join('topic_tag', 'topics.id', '=', 'topic_tag.topic_id')
            ->whereIn('topic_tag.tag_id', $tagIds)
            ->where('topics.status', 'open')
            ->whereNull('topics.deleted_at')
            ->whereNotExists(function ($q) use ($userId) {
                $q->select(DB::raw(1))->from('replies')
                    ->whereColumn('replies.topic_id', 'topics.id')
                    ->where('replies.user_id', $userId);
            })
            ->groupBy('topic_tag.tag_id')
            ->selectRaw('topic_tag.tag_id as tag_id, COUNT(DISTINCT topics.id) as c')
            ->pluck('c', 'tag_id');
    }
}
