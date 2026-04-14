<?php

namespace App\Services;

use App\Models\Reply;
use App\Models\Tag;
use App\Models\User;

class LeaderboardService
{
    /**
     * Get ranked candidates with filters and pagination
     */
    public function getCandidates(?string $search = null, ?string $tagSlug = null, int $perPage = 20)
    {
        $query = User::role('candidate')
            ->where('is_active', true)
            ->where('total_rank_score', '>', 0)
            ->withCount(['topics', 'replies'])
            ->addSelect([
                'likes_received' => Reply::selectRaw('COALESCE(SUM(likes_count), 0)')
                    ->whereColumn('user_id', 'users.id')
                    ->where('status', 'visible'),
            ]);

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($tagSlug) {
            $query->whereHas('replies.topic.tags', function ($q) use ($tagSlug) {
                $q->where('slug', $tagSlug);
            });
        }

        return $query->orderByDesc('total_rank_score')
            ->select('id', 'name', 'location', 'years_of_experience', 'total_rank_score', 'human_score')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Get approved tags for filter
     */
    public function getTags()
    {
        return Tag::approved()
            ->orderBy('name')
            ->select('id', 'name', 'slug')
            ->get();
    }
}