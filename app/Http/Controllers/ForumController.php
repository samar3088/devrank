<?php

namespace App\Http\Controllers;

use App\Services\ForumService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ForumController extends Controller
{
    public function __construct(
        private ForumService $forumService
    ) {}

    /**
     * Forum listing page
     */
    public function index(Request $request)
    {
        $topics = $this->forumService->getTopics(
            $request->input('search'),
            $request->input('category'),
            $request->input('filter')
        );

        $categories = $this->forumService->getCategories();
        $topContributors = $this->forumService->getTopContributors();
        $trendingTags = $this->forumService->getTrendingTags();

        return Inertia::render('Forum/Index', [
            'topics' => $topics,
            'categories' => $categories,
            'topContributors' => $topContributors,
            'trendingTags' => $trendingTags,
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', ''),
                'filter' => $request->input('filter', 'all'),
            ],
        ]);
    }

    /**
     * Topic detail page
     */
    public function show(string $slug)
    {
        $topic = $this->forumService->getTopic($slug);
        $userId = auth()->id();
        $replies = $this->forumService->getReplies($topic->id, 'likes', $userId);

        return Inertia::render('Forum/Topic', [
            'topic' => $topic,
            'replies' => $replies,
        ]);
    }

    /**
     * Show create topic form
     */
    public function create()
    {
        if (auth()->user()->isCompany()) {
            return redirect('/forum')->with('error', 'Companies cannot create forum topics.');
        }

        $categories = $this->forumService->getCategories();
        $tags = $this->forumService->getTrendingTags(50);

        return Inertia::render('Forum/Create', [
            'categories' => $categories,
            'tags' => $tags,
        ]);
    }

    /**
     * Store new topic
     */
    public function store(Request $request)
    {
        if ($request->user()->isCompany()) {
            return redirect('/forum')->with('error', 'Companies cannot create forum topics.');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255', 'min:10'],
            'body' => ['required', 'string', 'min:30'],
            'category_id' => ['required', 'exists:categories,id'],
            'tags' => ['nullable', 'array', 'max:10'],
            'tags.*' => ['integer', 'exists:tags,id'],
        ]);

        $topic = $this->forumService->createTopic($request->user(), $validated);

        return redirect("/forum/{$topic->slug}")
            ->with('success', 'Topic created successfully!');
    }

    /**
     * Store a reply
     */
    public function storeReply(Request $request, int $topicId)
    {
        if ($request->user()->isCompany()) {
            return back()->with('error', 'Companies cannot post forum replies.');
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'min:10'],
        ]);

        $this->forumService->createReply($request->user(), $topicId, $validated);
        $topic = \App\Models\Topic::findOrFail($topicId);

        return redirect("/forum/{$topic->slug}")
            ->with('success', 'Answer posted successfully!');
    }

    /**
     * Toggle like on a reply
     */
    public function toggleLike(Request $request, int $replyId)
    {
        if ($request->user()->isCompany()) {
            return back()->with('error', 'Companies cannot like forum replies.');
        }

        $result = $this->forumService->toggleLike($request->user(), $replyId);

        return back()->with('like_result', $result);
    }
}