<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Like;
use App\Models\Reply;
use App\Models\Tag;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Support\Str;

class ForumService
{
    // ── Categories ───────────────────────────────────────────────
    public function getCategories()
    {
        return Category::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'icon', 'color', 'description']);
    }

    // ── Tags ─────────────────────────────────────────────────────
    public function getTrendingTags(int $limit = 10)
    {
        return Tag::where('status', 'approved')
            ->withCount('topics')
            ->orderByDesc('topics_count')
            ->limit($limit)
            ->get(['id', 'name', 'slug']);
    }

    public function getApprovedTags(int $limit = 50)
    {
        return Tag::where('status', 'approved')
            ->orderBy('name')
            ->limit($limit)
            ->get(['id', 'name', 'slug']);
    }

    // ── Top contributors ─────────────────────────────────────────
    public function getTopContributors(int $limit = 5)
    {
        return User::whereHas('roles', fn ($q) => $q->where('name', 'candidate'))
            ->orderByDesc('total_rank_score')
            ->limit($limit)
            ->get(['id', 'name', 'total_rank_score', 'human_score']);
    }

    // ── Topic listing ────────────────────────────────────────────
    public function getTopics(?string $search, ?string $categorySlug, ?string $filter)
    {
        $query = Topic::with([
            'user:id,name',
            'category:id,name,slug,icon,color',
            'tags:id,name,slug',
        ])
        ->withCount('replies')
        ->whereIn('status', ['open', 'closed']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        if ($categorySlug) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $categorySlug));
        }

        match ($filter) {
            'hot'     => $query->where('is_hot', true)->orderByDesc('views_count'),
            'week'    => $query->where('created_at', '>=', now()->subWeek())->orderByDesc('replies_count'),
            'unanswered' => $query->where('replies_count', 0)->orderByDesc('created_at'),
            default   => $query->orderByDesc('is_pinned')->orderByDesc('last_reply_at'),
        };

        return $query->paginate(15)->withQueryString();
    }

    // ── Single topic ─────────────────────────────────────────────
    public function getTopic(string $slug): Topic
    {
        return Topic::with([
            'user:id,name,total_rank_score,human_score',
            'category:id,name,slug,icon',
            'tags:id,name,slug',
        ])
        ->whereIn('status', ['open', 'closed'])
        ->where('slug', $slug)
        ->firstOrFail();
    }

    // ── Replies for a topic ──────────────────────────────────────
    public function getReplies(int $topicId, string $sort = 'likes', ?int $authUserId = null): array
    {
        $replies = Reply::with(['user:id,name,total_rank_score,human_score'])
            ->where('topic_id', $topicId)
            ->where('status', 'visible')
            ->orderByDesc('is_accepted')
            ->orderByDesc('likes_count')
            ->orderBy('created_at')
            ->get();

        // Batch fetch liked reply IDs — single query, no N+1
        $likedIds = [];
        if ($authUserId) {
            $likedIds = Like::where('user_id', $authUserId)
                ->where('likeable_type', Reply::class)
                ->whereIn('likeable_id', $replies->pluck('id'))
                ->pluck('likeable_id')
                ->toArray();
        }

        return $replies->map(fn ($reply) => array_merge($reply->toArray(), [
            'is_liked' => in_array($reply->id, $likedIds),
        ]))->toArray();
    }

    // ── Create topic ─────────────────────────────────────────────
    public function createTopic(User $user, array $data): Topic
    {
        $topic = Topic::create([
            'user_id'     => $user->id,
            'category_id' => $data['category_id'],
            'title'       => $data['title'],
            'slug'        => $this->uniqueSlug($data['title']),
            'body'        => $data['body'],
            'status'      => 'open',
        ]);

        if (!empty($data['tags'])) {
            $topic->tags()->sync($data['tags']);
        }

        return $topic;
    }

    // ── Delete topic (soft) ──────────────────────────────────────
    public function deleteTopic(Topic $topic): void
    {
        $topic->delete();
    }

    // ── Create reply ─────────────────────────────────────────────
    public function createReply(User $user, int $topicId, array $data): Reply
    {
        $reply = Reply::create([
            'topic_id' => $topicId,
            'user_id'  => $user->id,
            'body'     => $data['body'],
            'status'   => 'visible',
        ]);

        // Update topic cached counters
        Topic::where('id', $topicId)->update([
            'replies_count' => \DB::raw('replies_count + 1'),
            'last_reply_at' => now(),
        ]);

        return $reply;
    }

    // ── Update reply ─────────────────────────────────────────────
    public function updateReply(Reply $reply, string $body): void
    {
        $reply->update(['body' => $body]);
    }

    // ── Delete reply (soft) ──────────────────────────────────────
    public function deleteReply(Reply $reply): void
    {
        $reply->delete();

        Topic::where('id', $reply->topic_id)->update([
            'replies_count' => \DB::raw('GREATEST(replies_count - 1, 0)'),
        ]);
    }

    // ── Accept answer ─────────────────────────────────────────────
    public function acceptReply(Topic $topic, Reply $reply): void
    {
        // Un-accept any previously accepted reply on this topic
        Reply::where('topic_id', $topic->id)
            ->where('is_accepted', true)
            ->update(['is_accepted' => false]);

        // Toggle: if same reply is accepted again, just unaccept
        $newValue = !$reply->is_accepted;
        $reply->update(['is_accepted' => $newValue]);
    }

    // ── Toggle like ───────────────────────────────────────────────
    public function toggleLike(User $user, int $replyId): array
    {
        $reply = Reply::findOrFail($replyId);

        $existing = Like::where('user_id', $user->id)
            ->where('likeable_type', Reply::class)
            ->where('likeable_id', $replyId)
            ->first();

        if ($existing) {
            $existing->delete();
            $reply->decrement('likes_count');
            return ['liked' => false, 'count' => $reply->likes_count];
        }

        Like::create([
            'user_id'       => $user->id,
            'likeable_type' => Reply::class,
            'likeable_id'   => $replyId,
        ]);
        $reply->increment('likes_count');

        return ['liked' => true, 'count' => $reply->likes_count];
    }

    // ── Helpers ──────────────────────────────────────────────────
    private function uniqueSlug(string $title): string
    {
        $slug = Str::slug($title);
        $count = Topic::withTrashed()->where('slug', 'like', "{$slug}%")->count();
        return $count ? "{$slug}-{$count}" : $slug;
    }
}