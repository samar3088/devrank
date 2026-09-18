<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Season;
use App\Models\SeasonScore;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Admin management of seasons (#8). Previously seasons could only be created via
 * SeasonSeeder/tinker — this makes running the competition self-serve.
 */
class SeasonController extends Controller
{
    public function index()
    {
        $seasons = Season::orderByDesc('starts_at')->get()->map(function (Season $s) {
            return [
                'id'          => $s->id,
                'name'        => $s->name,
                'starts_at'   => $s->starts_at->toDateString(),
                'ends_at'     => $s->ends_at->toDateString(),
                'is_active'   => $s->is_active,
                'live'        => $s->is_active && $s->starts_at->lte(now()) && $s->ends_at->gte(now()),
                'days_left'   => $s->daysLeft(),
                'challenges'  => Quiz::where('season_id', $s->id)->where('is_challenge', true)->count(),
                'players'     => SeasonScore::where('season_id', $s->id)->where('points', '>', 0)->count(),
            ];
        });

        return Inertia::render('Admin/Seasons/Index', [
            'seasons' => $seasons,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:120'],
            'starts_at' => ['required', 'date'],
            'ends_at'   => ['required', 'date', 'after:starts_at'],
            'activate'  => ['boolean'],
        ]);

        $season = Season::create([
            'name'      => $validated['name'],
            'starts_at' => $validated['starts_at'],
            'ends_at'   => $validated['ends_at'],
            'is_active' => false,
        ]);

        if (! empty($validated['activate'])) {
            $this->activateOnly($season);
        }

        return back()->with('success', 'Season created.');
    }

    /** Activate one season and deactivate the rest (single active season). */
    public function activate(Season $season)
    {
        $this->activateOnly($season);
        return back()->with('success', "“{$season->name}” is now the active season.");
    }

    public function close(Season $season)
    {
        $season->update(['is_active' => false]);
        return back()->with('success', "“{$season->name}” closed.");
    }

    public function destroy(Season $season)
    {
        // season_scores cascade; challenge quizzes keep their (now dangling) season_id
        // which is nulled by the FK's nullOnDelete.
        $season->delete();
        return back()->with('success', 'Season deleted.');
    }

    private function activateOnly(Season $season): void
    {
        Season::where('id', '!=', $season->id)->update(['is_active' => false]);
        $season->update(['is_active' => true]);
    }
}
