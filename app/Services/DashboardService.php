<?php

namespace App\Services;

use App\Models\JobApplication;
use App\Models\JobListing;
use App\Models\QuizAttempt;
use App\Models\Reply;
use App\Models\Tag;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    // ── Route to correct dashboard view ─────────────────────────
    public function getDashboardView(User $user): string
    {
        if ($user->hasRole('company')) {
            return 'Dashboard/CompanyDashboard';
        }

        return 'Dashboard/CandidateDashboard';
    }

    // ── Candidate stats ──────────────────────────────────────────
    public function getCandidateStats(User $user): array
    {
        // Forum stats — fetch replies once instead of 3 count/sum passes
        $replies          = $user->replies()->get(['status', 'is_accepted', 'likes_count']);
        $visibleReplies   = $replies->where('status', 'visible');
        $totalReplies     = $visibleReplies->count();
        $totalTopics      = $user->topics()->count();
        $totalLikes       = (int) $visibleReplies->sum('likes_count');
        $acceptedAnswers  = $replies->where('is_accepted', true)->count();

        // Global rank position
        $rankPosition = User::role('candidate')
            ->where('total_rank_score', '>', $user->total_rank_score)
            ->count() + 1;

        // Total candidates for rank context
        $totalCandidates = User::role('candidate')->count();

        // Top tag rankings — likes on replies grouped by tag
        $tagRankings = $this->getCandidateTagRankings($user->id);

        // Quiz stats — fetch completed attempts once instead of 3 count/sum passes
        $completedAttempts = QuizAttempt::where('user_id', $user->id)->where('status', 'completed')
            ->get(['passed', 'rank_points_awarded']);
        $quizAttempts   = $completedAttempts->count();
        $quizzesPassed  = $completedAttempts->where('passed', true)->count();
        $totalQuizPts   = (int) $completedAttempts->sum('rank_points_awarded');

        // Job applications
        $totalApplications = $user->jobApplications()->count();
        $pendingApplications = $user->jobApplications()
            ->whereIn('status', ['applied', 'reviewing'])->count();
        $monthlyAppRemaining = max(0,
            config('devrank.limits.monthly_applications', 5) - $user->monthly_job_applications
        );

        // Interest requests
        $interestsPending  = $user->receivedInterests()->where('status', 'pending')->count();
        $interestsAccepted = $user->receivedInterests()->where('status', 'accepted')->count();

        // Profile views (how many companies viewed)
        $profileViews = \App\Models\ProfileViewLog::where('candidate_id', $user->id)->count();

        // Weekly rank score history (last 8 weeks)
        // We track score snapshots — if no snapshot table, we estimate from attempts
        $weeklyHistory = $this->getWeeklyRankHistory($user->id, $user->total_rank_score);

        // Pending actions — quizzes not yet taken (whereDoesntHave avoids
        // pulling every attempted quiz_id into PHP for a whereNotIn).
        $untakenQuizCount = \App\Models\Quiz::published()
            ->whereDoesntHave('attempts', fn ($q) => $q->where('user_id', $user->id))
            ->count();

        return [
            // GitHub verified-import status (roadmap #6)
            'github' => [
                'verified'   => $user->github_verified_at !== null,
                'username'   => $user->github_username,
                'stats'      => $user->github_stats,
            ],

            // Verifiable embeddable rank credential (#2) — token or null (opt-in).
            'credential_token' => optional(app(CredentialService::class)->activeToken($user))->token,

            // Verified hire outcomes (#11) — hires a company recorded, awaiting confirmation.
            'pending_hires' => app(HireService::class)->pendingForCandidate($user->id),

            // Smart matching (#4) + bias-reduced hiring (#3)
            'open_to_work' => (bool) $user->open_to_work,
            'anonymous'    => (bool) $user->anonymous,
            'job_matches'  => collect(app(MatchService::class)->jobsForCandidate($user, 4))->map(fn ($m) => [
                'score'    => $m['score'],
                'title'    => $m['job']->title,
                'slug'     => $m['job']->slug,
                'company'  => $m['job']->company->company_name ?? $m['job']->company->name ?? '—',
                'location' => $m['job']->location,
                'job_type' => $m['job']->job_type,
            ]),

            // Rank
            'rank_score'          => $user->total_rank_score,
            'human_score'         => $user->human_score ?? 0,
            'rank_position'       => $rankPosition,
            'total_candidates'    => $totalCandidates,
            'rank_percentile'     => $totalCandidates > 0
                ? round((1 - ($rankPosition / $totalCandidates)) * 100)
                : 0,

            // Forum
            'total_replies'       => $totalReplies,
            'total_topics'        => $totalTopics,
            'total_likes'         => $totalLikes,
            'accepted_answers'    => $acceptedAnswers,

            // Tag rankings
            'tag_rankings'        => $tagRankings,

            // Quiz
            'quiz_attempts'       => $quizAttempts,
            'quizzes_passed'      => $quizzesPassed,
            'total_quiz_points'   => $totalQuizPts,

            // Applications
            'total_applications'       => $totalApplications,
            'pending_applications'     => $pendingApplications,
            'monthly_app_remaining'    => $monthlyAppRemaining,

            // Interests / outreach
            'interests_pending'   => $interestsPending,
            'interests_accepted'  => $interestsAccepted,
            'profile_views'       => $profileViews,

            // Chart
            'weekly_history'      => $weeklyHistory,

            // Pending actions
            'untaken_quiz_count'  => $untakenQuizCount,
        ];
    }

    // ── Company stats ────────────────────────────────────────────
    public function getCompanyStats(User $user): array
    {
        // Fetch jobs once (id + status) instead of 3 separate queries
        $jobs   = $user->jobListings()->get(['id', 'status']);
        $jobIds = $jobs->pluck('id');

        // One grouped query for all application statuses instead of 7 separate counts
        $appCounts = JobApplication::whereIn('jobs_listing_id', $jobIds)
            ->selectRaw('status, COUNT(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status');
        $appCount = fn ($status) => (int) ($appCounts[$status] ?? 0);
        $totalApplications = (int) $appCounts->sum();

        // Outreach breakdown in one pass instead of repeated queries
        $sentInterests     = $user->sentInterests()->get(['status']);
        $interestsSent     = $sentInterests->count();
        $interestsAccepted = $sentInterests->where('status', 'accepted')->count();
        $interestsPending  = $sentInterests->where('status', 'pending')->count();

        // Active jobs expiring within the next 7 days
        $expiringJobs = $user->jobListings()
            ->where('status', 'active')
            ->whereBetween('expires_at', [now(), now()->addDays(7)])
            ->count();

        return [
            'total_jobs'               => $jobs->count(),
            'active_jobs'              => $jobs->where('status', 'active')->count(),
            'expiring_jobs'            => $expiringJobs,
            'total_applications'       => $totalApplications,
            'total_applicants'         => $totalApplications, // alias for the dashboard card
            'new_applications'         => $appCount('applied'),
            'trust_score'              => (int) ($user->trust_score ?? 0),
            // Verified hires (#11) — provable hiring track record.
            'verified_hires'           => app(HireService::class)->verifiedHireCount($user->id),

            // Outreach / interest
            'interests_sent'           => $interestsSent,
            'interests_accepted'       => $interestsAccepted,
            'outreach_sent'            => $interestsSent,
            'outreach_accepted'        => $interestsAccepted,
            'outreach_pending'         => $interestsPending,

            'monthly_posts_remaining'  => max(0,
                config('devrank.limits.monthly_job_posts', 5) - $user->monthly_job_posts
            ),
            'monthly_interest_remaining' => max(0,
                config('devrank.limits.monthly_outreach', 10) - $user->monthly_outreach_sent
            ),

            // Pipeline stages (real counts)
            'pipeline' => [
                'applied'     => $appCount('applied'),
                'reviewing'   => $appCount('reviewing'),
                'shortlisted' => $appCount('shortlisted'),
                'interview'   => $appCount('interview'),
                'offered'     => $appCount('offered'),
                'hired'       => $appCount('hired'),
                'rejected'    => $appCount('rejected'),
            ],

            // Recent applicants across all jobs
            'recent_applicants' => app(JobService::class)->getRecentApplicants($user, 6),
        ];
    }

    // ── Tag rankings for a candidate ────────────────────────────
    /**
     * For each tag the candidate has answered in:
     * - Count their likes on replies in topics tagged with that tag
     * - Rank them against other candidates in the same tag
     */
    public function getCandidateTagRankings(int $userId, int $limit = 6): array
    {
        return app(TagRankingService::class)->forCandidate($userId, $limit);
    }

    // ── Weekly rank score history ────────────────────────────────
    /**
     * Builds an approximate 8-week history from quiz_attempts and replies.
     * Since we don't have a dedicated rank_snapshots table (future enhancement),
     * we reconstruct by summing points earned each week back from current score.
     */
    private function getWeeklyRankHistory(int $userId, int $currentScore): array
    {
        // Points earned per week (quiz attempts + estimated forum likes)
        $weeklyQuizPts = DB::table('quiz_attempts')
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subWeeks(8))
            ->select(
                DB::raw('YEARWEEK(completed_at, 1) as yw'),
                DB::raw('SUM(rank_points_awarded) as pts')
            )
            ->groupBy('yw')
            ->orderBy('yw')
            ->pluck('pts', 'yw');

        // Build 8-week array (most recent last)
        $weeks  = [];
        $labels = [];

        for ($i = 7; $i >= 0; $i--) {
            $date  = now()->subWeeks($i);
            $yw    = $date->format('oW'); // ISO year+week
            $weeks[$yw] = $weeklyQuizPts[$yw] ?? 0;
            $labels[]   = $date->format('M d');
        }

        // Reconstruct cumulative history ending at currentScore
        $totalTracked = array_sum($weeks);
        $baseScore    = max(0, $currentScore - $totalTracked);

        $history    = [];
        $running    = $baseScore;
        $weekKeys   = array_keys($weeks);

        foreach ($weekKeys as $i => $yw) {
            $running   += $weeks[$yw];
            $history[] = [
                'label' => $labels[$i],
                'score' => $running,
            ];
        }

        return $history;
    }
}