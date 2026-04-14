<?php

namespace App\Http\Controllers;

use App\Services\LeaderboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function __construct(
        private LeaderboardService $leaderboardService
    ) {}

    public function index(Request $request)
    {
        $candidates = $this->leaderboardService->getCandidates(
            $request->input('search'),
            $request->input('tag')
        );

        $tags = $this->leaderboardService->getTags();

        return Inertia::render('Leaderboard/Index', [
            'candidates' => $candidates,
            'tags' => $tags,
            'filters' => [
                'search' => $request->input('search', ''),
                'tag' => $request->input('tag', ''),
            ],
        ]);
    }
}