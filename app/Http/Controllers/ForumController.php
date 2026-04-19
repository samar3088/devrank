<?php

namespace App\Http\Controllers;

use App\Models\Reply;
use App\Models\Topic;
use App\Services\ForumService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ForumController extends Controller
{
    public function __construct(private ForumService $forumService) {}

    // ── Public: forum listing ────────────────────────────────────
    public function index(Request $request)
    {
        $topics = $this->forumService->getTopics(
            $request->input('search'),
            $request->input('category'),
            $request->input('filter')
        );

        return Inertia::render('Forum/Index', [
            'topics'           => $topics,
            'categories'       => $this->forumService->getCategories(),
            'topContributors'  => $this->forumService->getTopContributors(),
            'trendingTags'     => $this->forumService->getTrendingTags(),
            'filters'          => [
                'search'   => $request->input('search', ''),
                'category' => $request->input('category', ''),
                'filter'   => $request->input('filter', 'all'),
            ],
        ]);
    }

    // ── Public: topic detail ─────────────────────────────────────
    public function show(string $slug)
    {
        $topic   = $this->forumService->getTopic($slug);
        $userId  = auth()->id();
        $replies = $this->forumService->getReplies($topic->id, 'likes', $userId);

        $topic->increment('views_count');

        return Inertia::render('Forum/Topic', [
            'topic'   => $topic,
            'replies' => $replies,
        ]);
    }

    // ── Candidate: show create form ──────────────────────────────
    public function create()
    {
        return Inertia::render('Forum/Create', [
            'categories' => $this->forumService->getCategories(),
            'tags'       => $this->forumService->getApprovedTags(50),
        ]);
    }

    // ── Candidate: store new topic ───────────────────────────────
    public function store(Request $request)
    {
        // Route middleware handles company block (role:candidate)
        $validated = $request->validate([
            'title'       => ['required', 'string', 'min:10', 'max:255'],
            'body'        => ['required', 'string', 'min:30'],
            'category_id' => ['required', 'exists:categories,id'],
            'tags'        => ['nullable', 'array', 'max:10'],
            'tags.*'      => ['integer', 'exists:tags,id'],
        ]);

        $topic = $this->forumService->createTopic($request->user(), $validated);

        return redirect()->route('forum.show', $topic->slug)
            ->with('success', 'Topic created successfully!');
    }

    // ── Candidate: soft-delete own topic ────────────────────────
    public function destroyTopic(Request $request, Topic $topic)
    {
        abort_unless($topic->user_id === $request->user()->id, 403);

        $this->forumService->deleteTopic($topic);

        return redirect()->route('forum.index')
            ->with('success', 'Topic deleted.');
    }

    // ── Candidate: post a reply ──────────────────────────────────
    public function storeReply(Request $request, Topic $topic)
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'min:10'],
        ]);

        $this->forumService->createReply($request->user(), $topic->id, $validated);

        return redirect()->route('forum.show', $topic->slug)
            ->with('success', 'Answer posted!');
    }

    // ── Candidate: edit own reply ────────────────────────────────
    public function updateReply(Request $request, Reply $reply)
    {
        abort_unless($reply->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'body' => ['required', 'string', 'min:10'],
        ]);

        $this->forumService->updateReply($reply, $validated['body']);

        return back()->with('success', 'Answer updated.');
    }

    // ── Candidate: soft-delete own reply ────────────────────────
    public function destroyReply(Request $request, Reply $reply)
    {
        abort_unless($reply->user_id === $request->user()->id, 403);

        $this->forumService->deleteReply($reply);

        return back()->with('success', 'Answer deleted.');
    }

    // ── Candidate (topic owner): mark accepted answer ────────────
    public function acceptReply(Request $request, Topic $topic, Reply $reply)
    {
        abort_unless($topic->user_id === $request->user()->id, 403);
        abort_unless($reply->topic_id === $topic->id, 422);

        $this->forumService->acceptReply($topic, $reply);

        return back()->with('success', 'Answer marked as accepted.');
    }

    // ── Candidate: toggle like on a reply ────────────────────────
    public function toggleLike(Request $request, Reply $reply)
    {
        $result = $this->forumService->toggleLike($request->user(), $reply->id);

        return back()->with('like_result', $result);
    }
}