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

    public function getAnalyticsData(): array
    {
        // Last 8 weeks — new candidates per week
        $candidatesPerWeek = \DB::table('users')
            ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('roles.name', 'candidate')
            ->where('users.created_at', '>=', now()->subWeeks(8))
            ->select(\DB::raw('YEARWEEK(users.created_at, 1) as yw'), \DB::raw('COUNT(*) as count'))
            ->groupBy('yw')
            ->orderBy('yw')
            ->pluck('count', 'yw');
    
        // Last 8 weeks — new companies per week
        $companiesPerWeek = \DB::table('users')
            ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('roles.name', 'company')
            ->where('users.created_at', '>=', now()->subWeeks(8))
            ->select(\DB::raw('YEARWEEK(users.created_at, 1) as yw'), \DB::raw('COUNT(*) as count'))
            ->groupBy('yw')
            ->orderBy('yw')
            ->pluck('count', 'yw');
    
        // Last 8 weeks — job applications per week
        $applicationsPerWeek = \DB::table('job_applications')
            ->where('created_at', '>=', now()->subWeeks(8))
            ->select(\DB::raw('YEARWEEK(created_at, 1) as yw'), \DB::raw('COUNT(*) as count'))
            ->groupBy('yw')
            ->orderBy('yw')
            ->pluck('count', 'yw');
    
        // Last 8 weeks — forum topics per week
        $topicsPerWeek = \DB::table('topics')
            ->whereNull('deleted_at')
            ->where('created_at', '>=', now()->subWeeks(8))
            ->select(\DB::raw('YEARWEEK(created_at, 1) as yw'), \DB::raw('COUNT(*) as count'))
            ->groupBy('yw')
            ->orderBy('yw')
            ->pluck('count', 'yw');
    
        // Last 8 weeks — quiz attempts per week
        $quizAttemptsPerWeek = \DB::table('quiz_attempts')
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subWeeks(8))
            ->select(\DB::raw('YEARWEEK(completed_at, 1) as yw'), \DB::raw('COUNT(*) as count'))
            ->groupBy('yw')
            ->orderBy('yw')
            ->pluck('count', 'yw');
    
        // Top 5 tags by topic count
        $topTags = \DB::table('tags')
            ->leftJoin('topic_tag', 'tags.id', '=', 'topic_tag.tag_id')
            ->where('tags.status', 'approved')
            ->select('tags.name', \DB::raw('COUNT(topic_tag.topic_id) as topic_count'))
            ->groupBy('tags.id', 'tags.name')
            ->orderByDesc('topic_count')
            ->limit(5)
            ->get();
    
        // Build 8-week labels
        $weeks = [];
        for ($i = 7; $i >= 0; $i--) {
            $date  = now()->subWeeks($i);
            $yw    = $date->format('oW');
            $weeks[] = [
                'label'        => $date->format('M d'),
                'yw'           => $yw,
                'candidates'   => $candidatesPerWeek[$yw]   ?? 0,
                'companies'    => $companiesPerWeek[$yw]    ?? 0,
                'applications' => $applicationsPerWeek[$yw] ?? 0,
                'topics'       => $topicsPerWeek[$yw]       ?? 0,
                'quiz_attempts'=> $quizAttemptsPerWeek[$yw] ?? 0,
            ];
        }
    
        return [
            'weeks'    => $weeks,
            'top_tags' => $topTags,
            // Summary totals
            'totals'   => [
                'candidates'   => \App\Models\User::role('candidate')->count(),
                'companies'    => \App\Models\User::role('company')->count(),
                'jobs_active'  => \App\Models\JobListing::where('status', 'active')->count(),
                'applications' => \App\Models\JobApplication::count(),
                'topics'       => \App\Models\Topic::count(),
                'replies'      => \App\Models\Reply::count(),
                'quiz_attempts'=> \App\Models\QuizAttempt::where('status', 'completed')->count(),
                'ai_flagged'   => \App\Models\QuizAttempt::where('status', 'completed')->where('ai_flagged', true)->count(),
            ],
        ];
    }
}