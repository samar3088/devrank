<?php

namespace App\Services;

use App\Models\Reply;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PublicProfileService
{
    // ── Candidate public profile ─────────────────────────────────
    public function getCandidateProfile(int $userId): array
    {
        $user = User::where('id', $userId)
            ->where('is_active', true)
            ->select([
                'id', 'name', 'headline', 'location', 'bio',
                'years_of_experience', 'open_to_work', 'total_rank_score',
                'human_score', 'github_url', 'linkedin_url',
                'resume_url', 'email', 'avatar',
            ])
            ->firstOrFail();

        $repliesCount  = $user->replies()->where('status', 'visible')->count();
        $topicsCount   = $user->topics()->count();
        $likesReceived = (int) $user->replies()->where('status', 'visible')->sum('likes_count');

        // Top 5 recent answers (for Answers tab)
        $recentAnswers = Reply::with(['topic:id,title,slug', 'topic.tags:id,name,slug'])
            ->where('user_id', $userId)
            ->where('status', 'visible')
            ->orderByDesc('likes_count')
            ->limit(5)
            ->get()
            ->map(fn ($reply) => [
                'id'           => $reply->id,
                'body'         => $reply->body,
                'likes_count'  => $reply->likes_count,
                'is_accepted'  => $reply->is_accepted,
                'topic'        => [
                    'title' => $reply->topic?->title ?? '',
                    'slug'  => $reply->topic?->slug  ?? '',
                ],
                'tags'         => $reply->topic?->tags ?? [],
                'created_at'   => $reply->created_at,
            ]);

        // Real tag rankings from DB
        $tagRankings = $this->getCandidateTagRankings($userId);

        // Global rank position
        $rankPosition = User::role('candidate')
            ->where('total_rank_score', '>', $user->total_rank_score)
            ->count() + 1;

        return [
            'user'           => $user,
            'topics_count'   => $topicsCount,
            'replies_count'  => $repliesCount,
            'likes_received' => $likesReceived,
            'rank_position'  => $rankPosition,
            'recent_answers' => $recentAnswers,
            'tag_rankings'   => $tagRankings,
        ];
    }

    // ── Company public profile ────────────────────────────────────
    public function getCompanyProfile(int $userId): array
    {
        $user = User::where('id', $userId)
            ->where('is_active', true)
            ->firstOrFail();

        $activeJobs = $user->jobListings()
            ->where('status', 'active')
            ->with('tags:id,name,slug')
            ->latest()
            ->limit(5)
            ->get();

        return [
            'company'     => $user,
            'active_jobs' => $activeJobs,
            'jobs_count'  => $user->jobListings()->count(),
        ];
    }

    // ── Tag rankings ─────────────────────────────────────────────
    /**
     * For each tag the candidate has answered in, calculate:
     * 1. Their total likes on replies in topics tagged with that tag
     * 2. Their rank vs all other candidates in the same tag
     *
     * Returns top 6 tags by total_likes, ordered descending.
     */
    public function getCandidateTagRankings(int $userId, int $limit = 6): array
    {
        // Step 1: Candidate's likes per tag
        $myTagScores = DB::table('replies')
            ->join('topics',    'replies.topic_id',    '=', 'topics.id')
            ->join('topic_tag', 'topics.id',           '=', 'topic_tag.topic_id')
            ->join('tags',      'topic_tag.tag_id',    '=', 'tags.id')
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

        // Step 2: For each tag, count candidates ranked above this user
        return $myTagScores->map(function ($tag) use ($userId) {
            $rank = DB::table('replies')
                ->join('topics',    'replies.topic_id',  '=', 'topics.id')
                ->join('topic_tag', 'topics.id',         '=', 'topic_tag.topic_id')
                ->where('topic_tag.tag_id', $tag->tag_id)
                ->where('replies.user_id',  '!=', $userId)
                ->where('replies.status',   'visible')
                ->whereNull('replies.deleted_at')
                ->whereNull('topics.deleted_at')
                ->select(
                    'replies.user_id',
                    DB::raw('SUM(replies.likes_count) as total_likes')
                )
                ->groupBy('replies.user_id')
                ->having('total_likes', '>', (int) $tag->total_likes)
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
}