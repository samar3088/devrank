<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Reply;
use App\Models\Tag;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoForumSeeder extends Seeder
{
    public function run(): void
    {
        $arjun = User::where('email', 'arjun@devrank.com')->first();
        $priya = User::where('email', 'priya@devrank.com')->first();
        $rohan = User::where('email', 'rohan@devrank.com')->first();

        $frontend = Category::where('slug', 'frontend-development')->first();
        $backend = Category::where('slug', 'backend-development')->first();
        $sysDesign = Category::where('slug', 'system-design')->first();

        // ── Topic 1 ─────────────────────────────────────
        $topic1 = Topic::create([
            'user_id' => $arjun->id,
            'category_id' => $frontend->id,
            'title' => 'React 19 Server Components — When to use them vs Client Components?',
            'slug' => Str::slug('React 19 Server Components When to use them'),
            'body' => "I've been experimenting with React 19 and I'm confused about when to use Server Components vs Client Components. The docs say \"use server components by default\" but in practice it's not always clear.\n\nFor example, if I have a dashboard with charts that need real-time updates, should the chart wrapper be a server component that passes data to a client component? Or should the entire dashboard be client-side?\n\nWould love to hear from people who've shipped production apps with Server Components.",
            'status' => 'open',
            'is_pinned' => true,
            'views_count' => 342,
            'replies_count' => 2,
            'likes_count' => 28,
            'last_reply_at' => now()->subHours(3),
        ]);

        $reply1 = Reply::create([
            'topic_id' => $topic1->id,
            'user_id' => $priya->id,
            'body' => "Great question! Here's my rule of thumb after shipping two apps with RSC:\n\n**Use Server Components when:**\n- Fetching data (no useEffect needed)\n- Static or rarely changing content\n- SEO-critical pages\n- Heavy dependencies (markdown parsers, syntax highlighters)\n\n**Use Client Components when:**\n- You need useState, useEffect, or any hooks\n- Event handlers (onClick, onChange)\n- Browser APIs (localStorage, window)\n- Real-time updates\n\nFor your dashboard case: Make the layout a Server Component, fetch the initial data server-side, then pass it to a Client Component chart wrapper that handles real-time updates via WebSocket.",
            'status' => 'visible',
            'is_accepted' => true,
            'likes_count' => 45,
            'ai_score' => 2.1,
        ]);

        $reply2 = Reply::create([
            'topic_id' => $topic1->id,
            'user_id' => $rohan->id,
            'body' => "Adding to Priya's excellent answer — one thing that helped me was thinking about the \"boundary\" between server and client. You want to push that boundary as far down the component tree as possible.\n\nSo instead of making your entire page a client component, wrap only the interactive part in a client component and keep everything else on the server.",
            'status' => 'visible',
            'likes_count' => 18,
            'ai_score' => 1.5,
        ]);

        // ── Topic 2 ─────────────────────────────────────
        $topic2 = Topic::create([
            'user_id' => $rohan->id,
            'category_id' => $backend->id,
            'title' => 'Laravel Query Optimization — N+1 problem in production',
            'slug' => Str::slug('Laravel Query Optimization N plus 1 problem'),
            'body' => "We discovered our API endpoint was making 200+ queries for a single page load. Turned out to be the classic N+1 problem with Eloquent relations.\n\nI fixed it with eager loading but now I'm wondering — what's the best way to prevent this from happening again? Are there tools or patterns you use to catch N+1 queries early?",
            'status' => 'open',
            'views_count' => 189,
            'replies_count' => 1,
            'likes_count' => 15,
            'last_reply_at' => now()->subHours(8),
        ]);

        Reply::create([
            'topic_id' => $topic2->id,
            'user_id' => $arjun->id,
            'body' => "Use Laravel Debugbar in development — it shows you every query on each page. For CI/CD, add `Model::preventLazyLoading(!app()->isProduction())` in your AppServiceProvider. This throws an exception whenever a lazy load happens in dev, forcing you to fix N+1 issues before they reach production.\n\nAlso check out Spatie's Laravel Query Builder package for complex filtering — it handles eager loading automatically based on query params.",
            'status' => 'visible',
            'likes_count' => 22,
            'ai_score' => 3.0,
        ]);

        // ── Topic 3 ─────────────────────────────────────
        $topic3 = Topic::create([
            'user_id' => $priya->id,
            'category_id' => $sysDesign->id,
            'title' => 'How would you design a real-time leaderboard for 1M+ users?',
            'slug' => Str::slug('How to design real-time leaderboard million users'),
            'body' => "System design question that came up in my interview: Design a leaderboard that shows top 100 users by score, updates in real-time, and supports 1M+ concurrent users.\n\nMy approach was Redis Sorted Sets for the leaderboard + WebSocket for real-time updates. But the interviewer pushed on how to handle score recalculation efficiently.\n\nAnyone have a better approach?",
            'status' => 'open',
            'views_count' => 456,
            'replies_count' => 0,
            'likes_count' => 35,
        ]);

        // ── Attach Tags ─────────────────────────────────
        $react = Tag::where('slug', 'react')->first();
        $typescript = Tag::where('slug', 'typescript')->first();
        $laravel = Tag::where('slug', 'laravel')->first();
        $mysql = Tag::where('slug', 'mysql')->first();
        $redis = Tag::where('slug', 'redis')->first();
        $systemDesignTag = Tag::where('slug', 'system-design')->first();

        if ($react) $topic1->tags()->attach($react->id);
        if ($typescript) $topic1->tags()->attach($typescript->id);
        if ($laravel) $topic2->tags()->attach($laravel->id);
        if ($mysql) $topic2->tags()->attach($mysql->id);
        if ($redis) $topic3->tags()->attach($redis->id);
        if ($systemDesignTag) $topic3->tags()->attach($systemDesignTag->id);

        // Update category topic counts
        Category::query()->each(function ($category) {
            $category->update(['topics_count' => $category->topics()->count()]);
        });
    }
}