<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use App\Services\JobService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobController extends Controller
{
    public function __construct(
        private JobService $jobService
    ) {}

    /**
     * List company's jobs
     */
    public function index(Request $request)
    {
        $jobs = $this->jobService->getCompanyJobs(
            $request->user(),
            $request->input('search'),
            $request->input('status')
        );

        return Inertia::render('Company/Jobs/Index', [
            'jobs' => $jobs,
            'monthlyPostsRemaining' => config('devrank.limits.monthly_job_posts') - $request->user()->monthly_job_posts,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
            ],
        ]);
    }

    /**
     * Show create job form
     */
    public function create(Request $request)
    {
        $tags = $this->jobService->getApprovedTags();

        return Inertia::render('Company/Jobs/Create', [
            'tags' => $tags,
            'monthlyPostsRemaining' => config('devrank.limits.monthly_job_posts') - $request->user()->monthly_job_posts,
        ]);
    }

    /**
     * Store new job
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:50'],
            'requirements' => ['nullable', 'string'],
            'benefits' => ['nullable', 'string'],
            'job_type' => ['required', 'in:full-time,part-time,contract,freelance,internship'],
            'work_mode' => ['required', 'in:remote,onsite,hybrid'],
            'location' => ['nullable', 'string', 'max:255'],
            'experience_level' => ['nullable', 'in:junior,mid,senior,lead,principal'],
            'experience_range' => ['nullable', 'string', 'max:50'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0', 'gte:salary_min'],
            'salary_currency' => ['nullable', 'string', 'max:3'],
            'salary_period' => ['nullable', 'in:yearly,monthly,hourly'],
            'tags' => ['nullable', 'array', 'max:10'],
            'tags.*' => ['integer', 'exists:tags,id'],
        ]);

        $result = $this->jobService->createJob($request->user(), $validated);

        if (!$result['success']) {
            return back()->withErrors(['limit' => $result['message']]);
        }

        return redirect()->route('company.jobs.index')
            ->with('success', 'Job posted successfully!');
    }

    /**
     * Show edit job form
     */
    public function edit(Request $request, JobListing $job)
    {
        // Ensure company owns this job
        if (!$job->isOwnedBy($request->user())) {
            abort(403);
        }

        $job->load('tags:id,name,slug');
        $tags = $this->jobService->getApprovedTags();

        return Inertia::render('Company/Jobs/Edit', [
            'job' => $job,
            'tags' => $tags,
        ]);
    }

    /**
     * Update job
     */
    public function update(Request $request, JobListing $job)
    {
        if (!$job->isOwnedBy($request->user())) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:50'],
            'requirements' => ['nullable', 'string'],
            'benefits' => ['nullable', 'string'],
            'job_type' => ['required', 'in:full-time,part-time,contract,freelance,internship'],
            'work_mode' => ['required', 'in:remote,onsite,hybrid'],
            'location' => ['nullable', 'string', 'max:255'],
            'experience_level' => ['nullable', 'in:junior,mid,senior,lead,principal'],
            'experience_range' => ['nullable', 'string', 'max:50'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0', 'gte:salary_min'],
            'salary_currency' => ['nullable', 'string', 'max:3'],
            'salary_period' => ['nullable', 'in:yearly,monthly,hourly'],
            'tags' => ['nullable', 'array', 'max:10'],
            'tags.*' => ['integer', 'exists:tags,id'],
        ]);

        $this->jobService->updateJob($job, $validated);

        return redirect()->route('company.jobs.index')
            ->with('success', 'Job updated successfully!');
    }

    /**
     * Soft delete job
     */
    public function destroy(Request $request, JobListing $job)
    {
        if (!$job->isOwnedBy($request->user())) {
            abort(403);
        }

        $this->jobService->deleteJob($job);

        return redirect()->route('company.jobs.index')
            ->with('success', 'Job deleted successfully.');
    }
}