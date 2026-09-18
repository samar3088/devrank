<?php

namespace App\Http\Controllers;

use App\Services\SeasonService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SeasonController extends Controller
{
    public function __construct(private SeasonService $seasons) {}

    /** Public season hub: current season, leaderboard, leagues, live challenges. */
    public function index(Request $request)
    {
        $season = $this->seasons->current();

        if (! $season) {
            return Inertia::render('Challenges/Index', [
                'season' => null, 'leaderboard' => [], 'challenges' => [], 'standing' => null,
            ]);
        }

        return Inertia::render('Challenges/Index', [
            'season' => [
                'name'      => $season->name,
                'ends_at'   => $season->ends_at->toIso8601String(),
                'days_left' => $season->daysLeft(),
            ],
            'leaderboard' => $this->seasons->leaderboard($season, 25),
            'challenges'  => $this->seasons->activeChallenges($season),
            'standing'    => (Auth::check() && Auth::user()->hasRole('candidate'))
                ? $this->seasons->standingFor(Auth::id(), $season)
                : null,
        ]);
    }
}
