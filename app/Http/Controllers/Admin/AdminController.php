<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use App\Models\Reply;
use App\Models\Tag;
use App\Models\User;
use App\Services\AdminService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function __construct(private AdminService $adminService) {}

    // ── Dashboard ────────────────────────────────────────────────
    public function dashboard()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => $this->adminService->getDashboardStats(),
        ]);
    }

    // ── Users ────────────────────────────────────────────────────
    public function users(Request $request)
    {
        return Inertia::render('Admin/Users', [
            'users'   => $this->adminService->getUsers($request),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function toggleUser(User $user)
    {
        $active = $this->adminService->toggleUserStatus($user);
        return back()->with('success', $active ? 'User activated.' : 'User deactivated.');
    }

    // ── Companies ────────────────────────────────────────────────
    public function companies(Request $request)
    {
        return Inertia::render('Admin/Companies', [
            'companies' => $this->adminService->getCompanies($request),
            'filters'   => $request->only(['search', 'status']),
        ]);
    }

    public function toggleCompany(User $company)
    {
        $active = $this->adminService->toggleUserStatus($company);
        return back()->with('success', $active ? 'Company activated.' : 'Company deactivated.');
    }

    // ── Jobs ─────────────────────────────────────────────────────
    public function jobs(Request $request)
    {
        return Inertia::render('Admin/Jobs', [
            'jobs'    => $this->adminService->getJobs($request),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function toggleJobFeatured(JobListing $job)
    {
        $featured = $this->adminService->toggleJobFeatured($job);
        return back()->with('success', $featured ? 'Job featured.' : 'Job unfeatured.');
    }

    public function updateJobStatus(Request $request, JobListing $job)
    {
        $request->validate(['status' => ['required', 'in:active,paused,closed,expired']]);
        $this->adminService->updateJobStatus($job, $request->status);
        return back()->with('success', 'Job status updated.');
    }

    // ── Forum: topics ─────────────────────────────────────────────
    public function topics(Request $request)
    {
        return Inertia::render('Admin/Topics', [
            'topics'  => $this->adminService->getTopics($request),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    // ── Forum: moderation queue ───────────────────────────────────
    public function moderation(Request $request)
    {
        return Inertia::render('Admin/Moderation', [
            'replies' => $this->adminService->getFlaggedReplies($request),
            'filters' => $request->only(['search']),
        ]);
    }

    public function moderateReply(Request $request, Reply $reply)
    {
        $request->validate(['action' => ['required', 'in:restore,delete']]);
        $this->adminService->moderateReply($reply, $request->action);
        return back()->with('success', 'Reply updated.');
    }

    // ── Tags ─────────────────────────────────────────────────────
    public function tags(Request $request)
    {
        return Inertia::render('Admin/Tags', [
            'tags'    => $this->adminService->getTags($request),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function approveTag(Tag $tag)
    {
        $this->adminService->approveTag($tag);
        return back()->with('success', 'Tag approved.');
    }

    public function rejectTag(Tag $tag)
    {
        $this->adminService->rejectTag($tag);
        return back()->with('success', 'Tag rejected.');
    }

    // ── Profile access logs ───────────────────────────────────────
    public function profileLogs(Request $request)
    {
        return Inertia::render('Admin/ProfileLogs', [
            'logs'    => $this->adminService->getProfileLogs($request),
            'filters' => $request->only(['search']),
        ]);
    }

    public function analytics()
    {
        return Inertia::render('Admin/Analytics', [
            'data' => $this->adminService->getAnalyticsData(),
        ]);
    }
}