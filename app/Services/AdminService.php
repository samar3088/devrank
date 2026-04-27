<?php

namespace App\Services;

use App\Models\JobApplication;
use App\Models\JobListing;
use App\Models\ProfileViewLog;
use App\Models\Reply;
use App\Models\Tag;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Http\Request;

class AdminService
{
    // ── Dashboard stats ──────────────────────────────────────────
    public function getDashboardStats(): array
    {
        return [
            'total_candidates'    => User::role('candidate')->count(),
            'total_companies'     => User::role('company')->count(),
            'total_topics'        => Topic::count(),
            'total_jobs'          => JobListing::count(),
            'active_jobs'         => JobListing::where('status', 'active')->count(),
            'total_applications'  => JobApplication::count(),
            'pending_tags'        => Tag::where('status', 'pending')->count(),
            'flagged_replies'     => Reply::where('status', 'moderated')->count(),
            'new_candidates_week' => User::role('candidate')->where('created_at', '>=', now()->subWeek())->count(),
            'new_companies_week'  => User::role('company')->where('created_at', '>=', now()->subWeek())->count(),
        ];
    }

    // ── Users (candidates) ───────────────────────────────────────
    public function getUsers(Request $request)
    {
        return User::role('candidate')
            ->when($request->search, fn ($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when($request->status, fn ($q) =>
                $request->status === 'active'
                    ? $q->where('is_active', true)
                    : $q->where('is_active', false)
            )
            ->orderByDesc('total_rank_score')
            ->paginate(20)
            ->withQueryString();
    }

    // ── Companies ────────────────────────────────────────────────
    public function getCompanies(Request $request)
    {
        return User::role('company')
            ->when($request->search, fn ($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('company_name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when($request->status, fn ($q) =>
                $request->status === 'active'
                    ? $q->where('is_active', true)
                    : $q->where('is_active', false)
            )
            ->withCount(['jobListings', 'sentInterests'])
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();
    }

    // ── Jobs ─────────────────────────────────────────────────────
    public function getJobs(Request $request)
    {
        return JobListing::with(['company:id,name,company_name'])
            ->withCount('applications')
            ->when($request->search, fn ($q) =>
                $q->where('title', 'like', "%{$request->search}%")
            )
            ->when($request->status, fn ($q) =>
                $q->where('status', $request->status)
            )
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();
    }

    // ── Forum: topics ────────────────────────────────────────────
    public function getTopics(Request $request)
    {
        return Topic::with(['user:id,name', 'category:id,name'])
            ->when($request->search, fn ($q) =>
                $q->where('title', 'like', "%{$request->search}%")
            )
            ->when($request->status, fn ($q) =>
                $q->where('status', $request->status)
            )
            ->withTrashed()
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();
    }

    // ── Forum: replies (moderation queue) ────────────────────────
    public function getFlaggedReplies(Request $request)
    {
        return Reply::with(['user:id,name', 'topic:id,title,slug'])
            ->when($request->search, fn ($q) =>
                $q->where('body', 'like', "%{$request->search}%")
            )
            ->where('status', 'moderated')
            ->withTrashed()
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();
    }

    // ── Tags ─────────────────────────────────────────────────────
    public function getTags(Request $request)
    {
        return Tag::with('suggestedBy:id,name')
            ->when($request->search, fn ($q) =>
                $q->where('name', 'like', "%{$request->search}%")
            )
            ->when($request->status, fn ($q) =>
                $q->where('status', $request->status)
            )
            ->withCount('topics')
            ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')")
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();
    }

    // ── Profile access logs ───────────────────────────────────────
    public function getProfileLogs(Request $request)
    {
        return ProfileViewLog::with([
            'viewer:id,name,company_name',
            'profile:id,name',
        ])
        ->when($request->search, fn ($q) =>
            $q->whereHas('viewer', fn ($v) =>
                $v->where('company_name', 'like', "%{$request->search}%")
            )
        )
        ->orderByDesc('created_at')
        ->paginate(20)
        ->withQueryString();
    }

    // ── Actions ──────────────────────────────────────────────────
    public function toggleUserStatus(User $user): bool
    {
        $user->update(['is_active' => !$user->is_active]);
        return $user->is_active;
    }

    public function approveTag(Tag $tag): void
    {
        $tag->update(['status' => 'approved']);
    }

    public function rejectTag(Tag $tag): void
    {
        $tag->update(['status' => 'rejected']);
    }

    public function moderateReply(Reply $reply, string $action): void
    {
        // action: 'restore' or 'delete'
        if ($action === 'restore') {
            $reply->update(['status' => 'visible']);
        } else {
            $reply->delete();
        }
    }

    public function toggleJobFeatured(JobListing $job): bool
    {
        $job->update(['is_featured' => !$job->is_featured]);
        return $job->is_featured;
    }

    public function updateJobStatus(JobListing $job, string $status): void
    {
        $job->update(['status' => $status]);
    }
}