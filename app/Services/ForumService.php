<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Topic;
use App\Models\Reply;
use App\Models\Like;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Str;

class ForumService
{
    /**
     * Get all categories with topic counts
     */
    public function getCategories()
    {
        return Category::withCount('topics')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Get topics with filters and pagination
     */
    public function getTopics(?string $search = null, ?int $categoryId = null, ?string $filter = null, int $perPage = 15)
    {
        $query = Topic::with([
            'user:id,name,total_rank_score',
            'category:id,name,icon',
            'tags:id,name,slug',
        ])
        ->withCount(['replies', 'likes'])
        ->where('status', 'open');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($filter === 'hot') {
            $query->where('is_hot', true);
        } elseif ($filter === 'unanswered') {
            $query->has('replies', '=', 0);
        } elseif ($filter === 'solved') {
            $query->whereNotNull('accepted_reply_id');
        }

        $query->orderByDesc('is_pinned')->orderByDesc('created_at');

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Get a single topic with all data
     */
    public function getTopic(string $slug)
    {
        $topic = Topic::with([
            'user:id,name,total_rank_score,human_score',
            'category:id,name,slug,icon',
            'tags:id,name,slug',
        ])
        ->withCount(['replies', 'likes'])
        ->where('slug', $slug)
        ->where('status', 'open')
        ->firstOrFail();

        $topic->increment('views_count');

        return $topic;
    }

    /**
     * Get replies for a topic — optimized with eager loading
     */
    public function getReplies(int $topicId, ?string $sort = 'likes', ?int $userId = null)
    {
        $query = Reply::with([
            'user:id,name,total_rank_score,human_score',
        ])
        ->withCount('likes')
        ->where('topic_id', $topicId)
        ->where('status', 'visible');

        if ($sort === 'newest') {
            $query->orderByDesc('created_at');
        } else {
            $query->orderByDesc('is_accepted')->orderByDesc('likes_count');
        }

        $replies = $query->get();

        // Batch check likes for logged-in user (single query instead of N queries)
        if ($userId && $replies->isNotEmpty()) {
            $replyIds = $replies->pluck('id')->toArray();
            $likedIds = Like::where('user_id', $userId)
                ->where('likeable_type', Reply::class)
                ->whereIn('likeable_id', $replyIds)
                ->pluck('likeable_id')
                ->toArray();

            $replies->each(function ($reply) use ($likedIds) {
                $reply->is_liked = in_array($reply->id, $likedIds);
            });
        }

        return $replies;
    }

    /**
     * Create a new topic
     */
    public function createTopic(User $user, array $data): Topic
    {
        $topic = Topic::create([
            'user_id' => $user->id,
            'category_id' => $data['category_id'],
            'title' => $data['title'],
            'slug' => Str::slug($data['title']) . '-' . Str::random(6),
            'body' => $data['body'],
            'status' => 'open',
        ]);

        if (!empty($data['tags'])) {
            $tagIds = array_slice($data['tags'], 0, 10);
            $topic->tags()->sync($tagIds);
        }

        return $topic->load(['user:id,name', 'category:id,name', 'tags:id,name,slug']);
    }

    /**
     * Create a reply to a topic
     */
    public function createReply(User $user, int $topicId, array $data): Reply
    {
        $reply = Reply::create([
            'topic_id' => $topicId,
            'user_id' => $user->id,
            'body' => $data['body'],
            'status' => 'visible',
        ]);

        // Update topic reply count and last_reply_at
        Topic::where('id', $topicId)->update([
            'replies_count' => Reply::where('topic_id', $topicId)->where('status', 'visible')->count(),
            'last_reply_at' => now(),
        ]);

        return $reply->load('user:id,name,total_rank_score,human_score');
    }

    /**
     * Toggle like on a reply (optimized — single query for check + toggle)
     */
    public function toggleLike(User $user, int $replyId): array
    {
        $reply = Reply::findOrFail($replyId);

        $existing = Like::where('user_id', $user->id)
            ->where('likeable_type', Reply::class)
            ->where('likeable_id', $replyId)
            ->first();

        if ($existing) {
            $existing->delete();

            // Update cached count on reply
            $reply->decrement('likes_count');

            // Decrement rank score of reply author (not self-likes)
            if ($reply->user_id !== $user->id) {
                User::where('id', $reply->user_id)->decrement('total_rank_score', 10);
            }

            return ['liked' => false, 'count' => $reply->fresh()->likes_count];
        }

        Like::create([
            'user_id' => $user->id,
            'likeable_type' => Reply::class,
            'likeable_id' => $replyId,
        ]);

        // Update cached count on reply
        $reply->increment('likes_count');

        // Increment rank score of reply author (not self-likes)
        if ($reply->user_id !== $user->id) {
            User::where('id', $reply->user_id)->increment('total_rank_score', 10);
        }

        return ['liked' => true, 'count' => $reply->fresh()->likes_count];
    }

    /**
     * Get top contributors
     */
    public function getTopContributors(int $limit = 3)
    {
        return User::role('candidate')
            ->where('total_rank_score', '>', 0)
            ->orderByDesc('total_rank_score')
            ->take($limit)
            ->select('id', 'name', 'total_rank_score')
            ->get();
    }

    /**
     * Get trending tags
     */
    public function getTrendingTags(int $limit = 10)
    {
        return Tag::select('id', 'name', 'slug')
            ->approved()
            ->withCount('topics')
            ->orderByDesc('topics_count')
            ->take($limit)
            ->get();
    }
}