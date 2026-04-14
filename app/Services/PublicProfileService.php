<?php

namespace App\Services;

use App\Models\Reply;
use App\Models\User;
use Illuminate\Support\Str;

class PublicProfileService
{
    /**
     * Get candidate public profile data
     */
    public function getCandidateProfile(int $userId): array
    {
        $user = User::where('id', $userId)
            ->where('is_active', true)
            ->select('id', 'name', 'headline', 'location', 'bio', 'years_of_experience',
                'open_to_work', 'total_rank_score', 'human_score', 'github_url', 'linkedin_url')
            ->firstOrFail();

        $topicsCount = $user->topics()->count();
        $repliesCount = $user->replies()->where('status', 'visible')->count();
        $likesReceived = (int)$user->replies()->where('status', 'visible')->sum('likes_count');

        $recentAnswers = Reply::with(['topic:id,title,slug', 'topic.tags:id,name,slug'])
            ->where('user_id', $userId)
            ->where('status', 'visible')
            ->orderByDesc('likes_count')
            ->take(5)
            ->get()
            ->map(function ($reply) {
                return [
                    'id' => $reply->id,
                    'topic_title' => $reply->topic->title ?? '',
                    'topic_slug' => $reply->topic->slug ?? '',
                    'likes_count' => $reply->likes_count,
                    'is_accepted' => $reply->is_accepted,
                    'body_preview' => Str::limit(strip_tags($reply->body), 150),
                    'tags' => $reply->topic->tags ?? [],
                ];
            });

        return [
            'user' => $user,
            'topics_count' => $topicsCount,
            'replies_count' => $repliesCount,
            'likes_received' => $likesReceived,
            'recent_answers' => $recentAnswers,
        ];
    }

    /**
     * Get company public profile data
     */
    public function getCompanyProfile(int $userId): array
    {
        $user = User::where('id', $userId)
            ->where('is_active', true)
            ->select('id', 'name', 'company_name', 'company_website', 'company_size',
                'industry', 'company_description', 'company_logo', 'location', 'trust_score')
            ->firstOrFail();

        $activeJobs = $user->jobListings()
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->with('tags:id,name,slug')
            ->orderByDesc('published_at')
            ->get();

        $jobsCount = $user->jobListings()->count();

        return [
            'company' => $user,
            'active_jobs' => $activeJobs,
            'total_jobs_posted' => $jobsCount,
        ];
    }
}