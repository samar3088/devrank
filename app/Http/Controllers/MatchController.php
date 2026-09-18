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

        $anon = app(\App\Services\AnonymityService::class);
        $revealSet = $anon->revealSet($company);

        $matches = collect($this->matches->candidatesForJob($job, 20))->map(function ($m) use ($anon, $revealSet) {
            $c = $m['candidate'];
            $masked = $anon->shouldMask($c->id, (bool) $c->anonymous, $revealSet);
            return [
                'score' => $m['score'],
                'candidate' => [
                    'id'          => $c->id,
                    'name'        => $masked ? $anon->handle($c->id) : $c->name,
                    'headline'    => $c->headline,
                    'location'    => $masked ? null : $c->location,
                    'rank_score'  => (int) $c->total_rank_score,
                    'experience'  => $c->experience_level,
                    'masked'      => $masked,
                ],
            ];
        });

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

    /** Candidate toggles bias-reduced "anonymous" discovery mode (#3). */
    public function toggleAnonymous(Request $request)
    {
        $user = $request->user();
        $user->forceFill(['anonymous' => ! $user->anonymous])->save();

        return back()->with('success', $user->anonymous
            ? 'Anonymous mode on — companies see your rank and skills first, not your identity, until you accept their interest.'
            : 'Anonymous mode off — your name and profile are visible in discovery.');
    }
}
