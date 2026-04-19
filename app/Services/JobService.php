<?php

namespace App\Services;

use App\Models\JobListing;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Str;

class JobService
{
    /**
     * Get jobs for a company with filters
     */
    public function getCompanyJobs(User $user, ?string $search = null, ?string $status = null, int $perPage = 10)
    {
        $query = JobListing::where('user_id', $user->id)
            ->with('tags:id,name,slug')
            ->withCount('applications');

        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        return $query->orderByDesc('created_at')->paginate($perPage)->withQueryString();
    }

    /**
     * Create a new job listing
     */
    public function createJob(User $user, array $data): array
    {
        // Check monthly limit
        if (!$user->canPostJob()) {
            return [
                'success' => false,
                'message' => 'You have reached your monthly job posting limit (' . config('devrank.limits.monthly_job_posts') . ' jobs/month).',
            ];
        }

        $job = JobListing::create([
            'user_id' => $user->id,
            'title' => $data['title'],
            'slug' => Str::slug($data['title']) . '-' . Str::random(6),
            'description' => $data['description'],
            'requirements' => $data['requirements'] ?? null,
            'benefits' => $data['benefits'] ?? null,
            'job_type' => $data['job_type'],
            'work_mode' => $data['work_mode'],
            'location' => $data['location'] ?? null,
            'experience_level' => $data['experience_level'] ?? null,
            'experience_range' => $data['experience_range'] ?? null,
            'salary_min' => $data['salary_min'] ?? null,
            'salary_max' => $data['salary_max'] ?? null,
            'salary_currency' => $data['salary_currency'] ?? 'INR',
            'salary_period' => $data['salary_period'] ?? 'yearly',
            'status' => 'active',
            'published_at' => now(),
            'expires_at' => now()->addDays(config('devrank.jobs.expiry_days', 30)),
        ]);

        // Attach tags
        if (!empty($data['tags'])) {
            $tagIds = array_slice($data['tags'], 0, 10);
            $job->tags()->sync($tagIds);
        }

        // Increment monthly counter
        $user->increment('monthly_job_posts');

        return [
            'success' => true,
            'job' => $job,
        ];
    }

    /**
     * Update an existing job listing (company edits their job).
     */
    public function updateJob(JobListing $job, array $validated): JobListing
    {
        $job->update([
            'title'            => $validated['title'],
            'description'      => $validated['description'],
            'requirements'     => $validated['requirements'],
            'benefits'         => $validated['benefits'] ?? null,
            'job_type'         => $validated['job_type'],
            'work_mode'        => $validated['work_mode'],
            'location'         => $validated['location'] ?? null,
            'experience_level' => $validated['experience_level'] ?? null,
            'experience_range' => $validated['experience_range'] ?? null,
            'salary_min'       => $validated['salary_min'] ?? null,
            'salary_max'       => $validated['salary_max'] ?? null,
            'salary_currency'  => $validated['salary_currency'] ?? 'INR',
            'salary_period'    => $validated['salary_period'] ?? 'yearly',
            'status'           => $validated['status'],
        ]);
    
        // Sync tags (replaces existing tags entirely)
        if (isset($validated['tags'])) {
            $job->tags()->sync($validated['tags']);
        } else {
            $job->tags()->detach();
        }
    
        return $job->fresh();
    }

    /**
     * Soft delete a job
     */
    public function deleteJob(JobListing $job): void
    {
        $job->delete();
    }

    /**
     * Get approved tags for job form dropdown
     */
    public function getApprovedTags(): \Illuminate\Database\Eloquent\Collection
    {
        return Tag::approved()
            ->orderBy('name')
            ->select('id', 'name', 'slug')
            ->get();
    }

    /**
     * Get public job listings with filters
     */
    public function getPublicJobs(?string $search = null, ?string $jobType = null, ?string $workMode = null, ?string $experience = null, ?int $tagId = null, int $perPage = 15)
    {
        $query = JobListing::with([
            'company:id,name,company_name,trust_score',
            'tags:id,name,slug',
        ])
        ->withCount('applications')
        ->where('status', 'active')
        ->where('expires_at', '>', now());

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($jobType) {
            $query->where('job_type', $jobType);
        }

        if ($workMode) {
            $query->where('work_mode', $workMode);
        }

        if ($experience) {
            $query->where('experience_level', $experience);
        }

        if ($tagId) {
            $query->whereHas('tags', function ($q) use ($tagId) {
                $q->where('tags.id', $tagId);
            });
        }

        return $query->orderByDesc('is_featured')->orderByDesc('published_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Get single public job by slug
     */
    public function getPublicJob(string $slug)
    {
        return JobListing::with([
            'company:id,name,company_name,company_website,company_size,industry,trust_score,company_description',
            'tags:id,name,slug',
        ])
        ->withCount('applications')
        ->where('slug', $slug)
        ->where('status', 'active')
        ->firstOrFail();
    }

    /**
     * Apply to a job
     */
    public function applyToJob($user, int $jobId, array $data): array
    {
        $job = \App\Models\JobListing::where('id', $jobId)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        // Check monthly limit
        if (!$user->canApplyToJob()) {
            return ['success' => false, 'message' => 'You have reached your monthly application limit (5).'];
        }

        // Check duplicate
        $exists = \App\Models\JobApplication::where('jobs_listing_id', $jobId)
            ->where('user_id', $user->id)
            ->exists();

        if ($exists) {
            return ['success' => false, 'message' => 'You have already applied to this job.'];
        }

        // Create application
        $application = \App\Models\JobApplication::create([
            'jobs_listing_id' => $jobId,
            'user_id' => $user->id,
            'cover_letter' => $data['cover_letter'] ?? null,
            'resume_path' => $data['resume_path'] ?? null,
            'status' => 'applied',
        ]);

        // Increment monthly counter
        $user->increment('monthly_job_applications');

        // Update job application count
        $job->increment('applications_count');

        return ['success' => true, 'message' => 'Application submitted successfully!', 'application' => $application];
    }

    /**
     * Check if user has applied to a job
     */
    public function hasApplied(int $userId, int $jobId): bool
    {
        return \App\Models\JobApplication::where('jobs_listing_id', $jobId)
            ->where('user_id', $userId)
            ->exists();
    }

}