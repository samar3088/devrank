<?php

namespace App\Services;

use App\Models\Reply;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PublicProfileService
{
    // ── Candidate public profile ─────────────────────────────────
    public function getCandidateProfile(int $userId): array
    {
        $user = User::where('id', $userId)
            ->where('is_active', true)
            ->select([
                'id', 'name', 'headline', 'location', 'bio',
                'years_of_experience', 'open_to_work', 'anonymous', 'total_rank_score',
                'human_score', 'github_url', 'linkedin_url',
                'resume_path as resume_url', 'email', 'avatar',
            ])
            ->firstOrFail();

        // "Mutual interest" gate — single rule for both contact + identity: reveal
        // to the candidate, an admin, or a company whose interest they ACCEPTED.
        $contactUnlocked = app(AnonymityService::class)->canReveal($userId);

        // Contact details (email / resume / social links) are PRIVATE — nulled
        // here so the data never reaches an unauthorised client.
        if (! $contactUnlocked) {
            $user->email        = null;
            $user->resume_url   = null;
            $user->github_url   = null;
            $user->linkedin_url = null;
        }

        // Bias-reduced hiring (#3): an anonymous candidate's identity (name /
        // avatar / location) is masked until mutual interest — merit stays visible.
        $identityLocked = $user->anonymous && ! $contactUnlocked;
        if ($identityLocked) {
            $anon = app(AnonymityService::class);
            $user->name     = $anon->handle($userId);
            $user->avatar   = null;
            $user->location = null;
        }

        $repliesCount  = $user->replies()->where('status', 'visible')->count();
        $topicsCount   = $user->topics()->count();
        $likesReceived = (int) $user->replies()->where('status', 'visible')->sum('likes_count');

        // Top 5 recent answers (for Answers tab)
        $recentAnswers = Reply::with(['topic:id,title,slug', 'topic.tags:id,name,slug'])
            ->where('user_id', $userId)
            ->where('status', 'visible')
            ->orderByDesc('likes_count')
            ->limit(5)
            ->get()
            ->map(fn ($reply) => [
                'id'           => $reply->id,
                'body'         => $reply->body,
                'likes_count'  => $reply->likes_count,
                'is_accepted'  => $reply->is_accepted,
                'topic'        => [
                    'title' => $reply->topic?->title ?? '',
                    'slug'  => $reply->topic?->slug  ?? '',
                ],
                'tags'         => $reply->topic?->tags ?? [],
                'created_at'   => $reply->created_at,
            ]);

        // Real tag rankings from DB
        $tagRankings = $this->getCandidateTagRankings($userId);

        // Global rank position
        $rankPosition = User::role('candidate')
            ->where('total_rank_score', '>', $user->total_rank_score)
            ->count() + 1;

        return [
            'user'             => $user,
            'topics_count'     => $topicsCount,
            'replies_count'    => $repliesCount,
            'likes_received'   => $likesReceived,
            'rank_position'    => $rankPosition,
            'recent_answers'   => $recentAnswers,
            'tag_rankings'     => $tagRankings,
            'contact_unlocked' => $contactUnlocked,
            'identity_locked'  => $identityLocked,
        ];
    }


    // ── Company public profile ────────────────────────────────────
    public function getCompanyProfile(int $userId): array
    {
        $user = User::where('id', $userId)
            ->where('is_active', true)
            ->firstOrFail();

        $activeJobs = $user->jobListings()
            ->where('status', 'active')
            ->with('tags:id,name,slug')
            ->latest()
            ->limit(5)
            ->get();

        return [
            'company'     => $user,
            'active_jobs' => $activeJobs,
            'jobs_count'  => $user->jobListings()->count(),
        ];
    }

    // ── Tag rankings ─────────────────────────────────────────────
    /**
     * For each tag the candidate has answered in, calculate:
     * 1. Their total likes on replies in topics tagged with that tag
     * 2. Their rank vs all other candidates in the same tag
     *
     * Returns top 6 tags by total_likes, ordered descending.
     */
    public function getCandidateTagRankings(int $userId, int $limit = 6): array
    {
        return app(TagRankingService::class)->forCandidate($userId, $limit);
    }
}