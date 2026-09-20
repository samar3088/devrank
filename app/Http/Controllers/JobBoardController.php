<?php

namespace App\Http\Controllers;

use App\Services\JobService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobBoardController extends Controller
{
    public function __construct(
        private JobService $jobService
    ) {}

    /**
     * Public jobs listing page
     */
    public function index(Request $request)
    {
        // Filters are multi-select — normalise each to an array of values.
        $jobType    = array_values(array_filter((array) $request->input('job_type', [])));
        $workMode   = array_values(array_filter((array) $request->input('work_mode', [])));
        $experience = array_values(array_filter((array) $request->input('experience', [])));

        $jobs = $this->jobService->getPublicJobs(
            $request->input('search'),
            $jobType,
            $workMode,
            $experience,
            $request->input('tag')
        );

        $tags = $this->jobService->getApprovedTags();

        return Inertia::render('JobBoard/Index', [
            'jobs' => $jobs,
            'tags' => $tags,
            'filters' => [
                'search' => $request->input('search', ''),
                'job_type' => $jobType,
                'work_mode' => $workMode,
                'experience' => $experience,
                'tag' => $request->input('tag', ''),
            ],
        ]);
    }

    /**
     * Public job detail page
     */
    public function show(string $slug)
    {
        $job = $this->jobService->getPublicJob($slug);
        $job->increment('views_count');

        $hasApplied = false;
        $canApply = false;

        if (auth()->check() && auth()->user()->isCandidate()) {
            $hasApplied = $this->jobService->hasApplied(auth()->id(), $job->id);
            $canApply = auth()->user()->canApplyToJob();
        }

        return Inertia::render('JobBoard/Show', [
            'job' => $job,
            'hasApplied' => $hasApplied,
            'canApply' => $canApply,
        ]);
    }

    /**
     * Apply to a job
     */
    public function apply(Request $request, int $jobId)
    {
        if ($request->user()->isCompany()) {
            return back()->with('error', 'Companies cannot apply to jobs.');
        }

        $validated = $request->validate([
            'cover_letter' => ['nullable', 'string', 'max:2000'],
        ]);

        $result = $this->jobService->applyToJob($request->user(), $jobId, $validated);

        if (!$result['success']) {
            return back()->with('error', $result['message']);
        }

        return back()->with('success', $result['message']);
    }
}