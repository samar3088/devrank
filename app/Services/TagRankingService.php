<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

/**
 * Per-tag leaderboard rankings for a candidate (based on likes earned on their
 * forum replies within each tag). Single source of truth shared by the
 * dashboard and public profile.
 *
 * Uses 2 queries total (was 1 + N — one ranking query per tag) and ranks
 * in-memory so it works on any MySQL version (no window functions required).
 */
class TagRankingService
{
    public function forCandidate(int $userId, int $limit = 6): array
    {
        // 1. The candidate's top tags by total likes earned.
        $myTagScores = DB::table('replies')
            ->join('topics',    'replies.topic_id', '=', 'topics.id')
            ->join('topic_tag', 'topics.id',        '=', 'topic_tag.topic_id')
            ->join('tags',      'topic_tag.tag_id', '=', 'tags.id')
            ->where('replies.user_id', $userId)
            ->where('replies.status', 'visible')
            ->whereNull('replies.deleted_at')
            ->whereNull('topics.deleted_at')
            ->where('tags.status', 'approved')
            ->select(
                'tags.id   as tag_id',
                'tags.name as tag_name',
                'tags.slug as tag_slug',
                DB::raw('SUM(replies.likes_count) as total_likes')
            )
            ->groupBy('tags.id', 'tags.name', 'tags.slug')
            ->orderByDesc('total_likes')
            ->limit($limit)
            ->get();

        if ($myTagScores->isEmpty()) {
            return [];
        }

        $tagIds = $myTagScores->pluck('tag_id')->all();

        // 2. One query for every user's like total in those tags, then rank in memory.
        $scoresByTag = DB::table('replies')
            ->join('topics',    'replies.topic_id', '=', 'topics.id')
            ->join('topic_tag', 'topics.id',        '=', 'topic_tag.topic_id')
            ->whereIn('topic_tag.tag_id', $tagIds)
            ->where('replies.status', 'visible')
            ->whereNull('replies.deleted_at')
            ->whereNull('topics.deleted_at')
            ->select(
                'topic_tag.tag_id',
                'replies.user_id',
                DB::raw('SUM(replies.likes_count) as total_likes')
            )
            ->groupBy('topic_tag.tag_id', 'replies.user_id')
            ->get()
            ->groupBy('tag_id');

        return $myTagScores->map(function ($tag) use ($scoresByTag, $userId) {
            $myLikes = (int) $tag->total_likes;

            // How many OTHER users have more likes in this tag → rank = ahead + 1
            $ahead = ($scoresByTag->get($tag->tag_id) ?? collect())
                ->filter(fn ($r) => (int) $r->user_id !== $userId && (int) $r->total_likes > $myLikes)
                ->count();

            return [
                'tag_id'      => $tag->tag_id,
                'tag_name'    => $tag->tag_name,
                'tag_slug'    => $tag->tag_slug,
                'total_likes' => $myLikes,
                'rank'        => $ahead + 1,
            ];
        })->toArray();
    }
}
