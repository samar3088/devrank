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

        $result = $query->orderByDesc('total_rank_score')
            // addSelect (not select) so the withCount() + likes_received subquery
            // columns above aren't clobbered — otherwise Forum/Answers/Likes
            // render 0 for every candidate.
            ->addSelect('id', 'name', 'location', 'years_of_experience', 'total_rank_score', 'human_score', 'avatar', 'anonymous')
            ->paginate($perPage)
            ->withQueryString();

        // Bias-reduced hiring (#3): mask anonymous candidates' identity for
        // viewers without mutual interest — merit (rank/score) stays visible.
        $anon = app(AnonymityService::class);
        $revealSet = $anon->revealSet();
        $result->getCollection()->transform(function ($u) use ($anon, $revealSet) {
            if ($anon->shouldMask($u->id, (bool) $u->anonymous, $revealSet)) {
                $u->name     = $anon->handle($u->id);
                $u->location = null;
                $u->avatar   = null;
                $u->masked   = true;
            } else {
                $u->masked = false;
            }
            unset($u->anonymous);
            return $u;
        });

        return $result;
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