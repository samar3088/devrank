<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobListing;
use App\Services\HireService;
use App\Services\JobService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
    public function edit(JobListing $job)
    {
        // Ensure company owns this job
        if ($job->user_id !== Auth::id()) {
            abort(403);
        }
    
        $tags = $this->jobService->getApprovedTags();
    
        // Load the job's existing tags so Edit.jsx can pre-select them
        $job->load('tags:id,name,slug');
    
        // Also load applications_count and views_count for the info sidebar
        $job->loadCount('applications');
    
        return Inertia::render('Company/Jobs/Edit', [
            'job'  => $job,
            'tags' => $tags,
        ]);
    }

    /**
     * Update job (with tag sync)
     */
    public function update(Request $request, JobListing $job)
    {
        if ($job->user_id !== Auth::id()) {
            abort(403);
        }
        
        $validated = $request->validate([
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['required', 'string', 'min:30'],
            'requirements'     => ['required', 'string', 'min:10'],
            'benefits'         => ['nullable', 'string'],
            'job_type'         => ['required', 'in:full-time,part-time,contract,freelance,internship'],
            'work_mode'        => ['required', 'in:onsite,remote,hybrid'],
            'location'         => ['nullable', 'string', 'max:255'],
            'experience_level' => ['nullable', 'string', 'max:100'],
            'experience_range' => ['nullable', 'string', 'max:100'],
            'salary_min'       => ['nullable', 'numeric', 'min:0'],
            'salary_max'       => ['nullable', 'numeric', 'min:0'],
            'salary_currency'  => ['nullable', 'string', 'size:3'],
            'salary_period'    => ['nullable', 'in:yearly,monthly'],
            'status'           => ['required', 'in:active,paused,closed'],
            'tags'             => ['nullable', 'array', 'max:10'],
            'tags.*'           => ['integer', 'exists:tags,id'],
        ]);
        
        $this->jobService->updateJob($job, $validated);
        
        return redirect()->route('company.jobs.index')
            ->with('success', 'Job updated successfully.');
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

    /**
     * View everyone who applied to a job + move them through the pipeline.
     */
    public function applicants(JobListing $job)
    {
        if ($job->user_id !== Auth::id()) {
            abort(403);
        }

        $job->load('tags:id,name,slug');

        $applicants = $this->jobService->getJobApplicants($job);
        $slaCounts  = $this->jobService->getApplicantSlaCounts($job);

        return Inertia::render('Company/Jobs/Applicants', [
            'job' => [
                'id'       => $job->id,
                'title'    => $job->title,
                'slug'     => $job->slug,
                'status'   => $job->status,
                'location' => $job->location,
                'job_type' => $job->job_type,
            ],
            'applicants'   => $applicants,
            'statuses'     => ['applied', 'reviewing', 'shortlisted', 'interview', 'offered', 'rejected'],
            'slaDays'      => (int) config('devrank.sla.response_days', 14),
            'slaOverdue'   => $slaCounts['overdue'],
            'awaitingCount'=> $slaCounts['awaiting'],
        ]);
    }

    /**
     * Update an applicant's pipeline status (owner-scoped).
     */
    public function updateApplicationStatus(Request $request, JobApplication $application)
    {
        if ($application->jobListing->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'status'           => ['required', 'in:applied,reviewing,shortlisted,interview,offered,rejected'],
            // A rejection must carry a reason — no silent closes (transparency/SLA).
            'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string', 'min:10', 'max:1000'],
        ], [
            'rejection_reason.required_if' => 'A rejection reason is required before closing a candidate.',
            'rejection_reason.min'         => 'Please give a rejection reason of at least 10 characters.',
        ]);

        $this->jobService->updateApplicationStatus(
            $application,
            $validated['status'],
            $validated['rejection_reason'] ?? null
        );

        return back()->with('success', 'Applicant status updated.');
    }

    /**
     * Record a verified hire for an applicant (#11). Captures the real offer
     * figure; the candidate then confirms it on their side.
     */
    public function hire(Request $request, JobApplication $application, HireService $hireService)
    {
        if ($application->jobListing->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'offered_salary'  => ['nullable', 'integer', 'min:0', 'max:1000000000'],
            'salary_currency' => ['nullable', 'string', 'size:3'],
            'salary_period'   => ['nullable', 'in:yearly,monthly'],
            'starts_on'       => ['nullable', 'date'],
        ]);

        $hireService->recordHire($application, $validated);

        return back()->with('success', 'Hire recorded — the candidate has been asked to confirm.');
    }
}