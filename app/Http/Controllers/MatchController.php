<?php

namespace App\Http\Controllers;

use App\Models\JobListing;
use App\Services\MatchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MatchController extends Controller
{
    public function __construct(private MatchService $matches) {}

    /**
     * Company "Browse Talent" — open_to_work candidates ranked by match to one
     * of the company's active jobs (defaults to the newest).
     */
    public function talent(Request $request)
    {
        $company = $request->user();

        $jobs = $company->jobListings()
            ->where('status', 'active')
            ->orderByDesc('created_at')
            ->get(['id', 'title']);

        if ($jobs->isEmpty()) {
            return Inertia::render('Company/Talent', [
                'jobs' => [], 'selectedJobId' => null, 'matches' => [],
            ]);
        }

        $selectedId = (int) $request->input('job', $jobs->first()->id);
        $job = JobListing::with('tags:id')->where('user_id', $company->id)->findOrFail($selectedId);

        $matches = collect($this->matches->candidatesForJob($job, 20))->map(fn ($m) => [
            'score' => $m['score'],
            'candidate' => [
                'id'          => $m['candidate']->id,
                'name'        => $m['candidate']->name,
                'headline'    => $m['candidate']->headline,
                'location'    => $m['candidate']->location,
                'rank_score'  => (int) $m['candidate']->total_rank_score,
                'experience'  => $m['candidate']->experience_level,
            ],
        ]);

        return Inertia::render('Company/Talent', [
            'jobs'          => $jobs,
            'selectedJobId' => $selectedId,
            'matches'       => $matches,
        ]);
    }

    /** Candidate toggles their "open to work" availability. */
    public function toggleAvailability(Request $request)
    {
        $user = $request->user();
        $user->forceFill(['open_to_work' => ! $user->open_to_work])->save();

        return back()->with('success', $user->open_to_work
            ? 'You are now visible to companies as open to work.'
            : 'You are no longer listed as open to work.');
    }
}
