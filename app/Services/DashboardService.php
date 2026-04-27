<?php

namespace App\Services;

use App\Models\User;
use App\Models\Topic;
use App\Models\JobListing;
use App\Models\JobApplication;
use App\Models\InterestRequest;

class DashboardService
{
    /**
     * Determine which dashboard view to render based on role
     */
    public function getDashboardView(User $user): string
    {
        if ($user->hasRole('company')) {
            return 'Dashboard/CompanyDashboard';
        }
    
        return 'Dashboard/CandidateDashboard';
    }

    /**
     * Get admin dashboard stats
     */
    public function getAdminStats(): array
    {
        return [
            'total_users' => User::count(),
            'total_candidates' => User::role('candidate')->count(),
            'total_companies' => User::role('company')->count(),
            'total_topics' => Topic::count(),
            'total_jobs' => JobListing::count(),
            'active_jobs' => JobListing::active()->count(),
            'total_applications' => JobApplication::count(),
            'pending_interests' => InterestRequest::pending()->count(),
        ];
    }

    /**
     * Get company dashboard stats
     */
    public function getCompanyStats($user): array
    {
        $activeJobs = \App\Models\JobListing::where('user_id', $user->id)
            ->where('status', 'active')
            ->count();

        $totalApplicants = \App\Models\JobApplication::whereHas('jobListing', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->count();

        $expiringJobs = \App\Models\JobListing::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('expires_at', '<=', now()->addDays(7))
            ->count();

        $interestsAccepted = \App\Models\InterestRequest::where('company_id', $user->id)
            ->where('status', 'accepted')
            ->count();

        $outreachSent = \App\Models\InterestRequest::where('company_id', $user->id)->count();
        $outreachPending = \App\Models\InterestRequest::where('company_id', $user->id)
            ->where('status', 'pending')
            ->count();
        $outreachAccepted = \App\Models\InterestRequest::where('company_id', $user->id)
            ->where('status', 'accepted')
            ->count();

        $monthlyOutreachLimit = config('devrank.limits.monthly_outreach', 10);
        $monthlyOutreachRemaining = $monthlyOutreachLimit - $user->monthly_outreach_sent;

        // Recent applicants
        $recentApplicants = \App\Models\JobApplication::whereHas('jobListing', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->with(['user:id,name,total_rank_score,human_score', 'jobListing:id,title'])
        ->latest()
        ->take(5)
        ->get()
        ->map(function ($app) {
            return [
                'id' => $app->id,
                'candidate_name' => $app->user->name ?? 'Unknown',
                'candidate_initials' => collect(explode(' ', $app->user->name ?? 'U'))->map(fn($n) => $n[0])->join(''),
                'candidate_score' => $app->user->total_rank_score ?? 0,
                'job_title' => $app->jobListing->title ?? '',
                'status' => $app->status,
                'applied_at' => $app->created_at->diffForHumans(),
            ];
        });

        return [
            'active_jobs' => $activeJobs,
            'expiring_jobs' => $expiringJobs,
            'total_applicants' => $totalApplicants,
            'interests_accepted' => $interestsAccepted,
            'outreach_sent' => $outreachSent,
            'outreach_pending' => $outreachPending,
            'outreach_accepted' => $outreachAccepted,
            'monthly_outreach_remaining' => $monthlyOutreachRemaining,
            'recent_applicants' => $recentApplicants,
        ];
    }

    /**
     * Get candidate dashboard stats
     */
    public function getCandidateStats($user): array
    {
        $topicsCount = \App\Models\Topic::where('user_id', $user->id)->count();
        $repliesCount = \App\Models\Reply::where('user_id', $user->id)->where('status', 'visible')->count();
        $likesReceived = \App\Models\Reply::where('user_id', $user->id)
            ->where('status', 'visible')
            ->sum('likes_count');
        $applicationsCount = \App\Models\JobApplication::where('user_id', $user->id)->count();
        $interestRequests = \App\Models\InterestRequest::where('candidate_id', $user->id)->count();
        $pendingOutreach = \App\Models\InterestRequest::where('candidate_id', $user->id)
            ->where('status', 'pending')->count();
        $monthlyAppsRemaining = config('devrank.limits.monthly_applications', 5) - $user->monthly_job_applications;

        return [
            'total_rank_score' => $user->total_rank_score ?? 0,
            'human_score' => $user->human_score ?? 0,
            'topics_count' => $topicsCount,
            'replies_count' => $repliesCount,
            'likes_received' => (int)$likesReceived,
            'applications_count' => $applicationsCount,
            'interest_requests' => $interestRequests,
            'pending_outreach' => $pendingOutreach,
            'monthly_apps_remaining' => $monthlyAppsRemaining,
        ];
    }
}