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
        if ($user->hasRole(['super_admin', 'sub_admin'])) {
            return 'Dashboard/AdminDashboard';
        }

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
    public function getCompanyStats(User $user): array
    {
        return [
            'total_jobs' => $user->jobListings()->count(),
            'active_jobs' => $user->jobListings()->where('status', 'active')->count(),
            'total_applications' => JobApplication::whereIn(
                'jobs_listing_id',
                $user->jobListings()->pluck('id')
            )->count(),
            'interests_sent' => $user->sentInterests()->count(),
            'interests_accepted' => $user->sentInterests()->accepted()->count(),
            'monthly_outreach_remaining' => config('devrank.limits.monthly_outreach') - $user->monthly_outreach_sent,
            'monthly_posts_remaining' => config('devrank.limits.monthly_job_posts') - $user->monthly_job_posts,
        ];
    }

    /**
     * Get candidate dashboard stats
     */
    public function getCandidateStats(User $user): array
    {
        return [
            'total_topics' => $user->topics()->count(),
            'total_replies' => $user->replies()->count(),
            'total_likes_received' => $user->replies()->sum('likes_count'),
            'rank_score' => $user->total_rank_score,
            'human_score' => $user->human_score,
            'applications_sent' => $user->jobApplications()->count(),
            'interests_received' => $user->receivedInterests()->count(),
            'interests_pending' => $user->receivedInterests()->pending()->count(),
            'monthly_applications_remaining' => config('devrank.limits.monthly_applications') - $user->monthly_job_applications,
        ];
    }
}