<?php

namespace App\Http\Controllers;

use App\Services\GithubImportService;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

/**
 * GitHub "connect" flow for logged-in candidates — verifies GitHub ownership
 * and imports contribution signals as a verified rank source (roadmap #6).
 * This is an account link, not a login provider.
 */
class GithubController extends Controller
{
    public function __construct(private GithubImportService $importer) {}

    /**
     * Send the candidate to GitHub for authorization.
     */
    public function redirect(Request $request)
    {
        abort_unless(config('devrank.github.enabled'), 404);

        return Socialite::driver('github')
            ->scopes(['read:user'])
            ->redirect();
    }

    /**
     * Handle the OAuth callback: verify identity + import stats.
     */
    public function callback(Request $request)
    {
        abort_unless(config('devrank.github.enabled'), 404);

        // User denied authorization or the flow errored.
        if ($request->has('error') || ! $request->has('code')) {
            return redirect()->route('dashboard')->with('error', 'GitHub connection was cancelled.');
        }

        try {
            $githubUser = Socialite::driver('github')->user();
        } catch (\Throwable $e) {
            return redirect()->route('dashboard')->with('error', 'Could not connect to GitHub. Please try again.');
        }

        try {
            $stats = $this->importer->linkAndImport($request->user(), $githubUser);
        } catch (\RuntimeException $e) {
            return redirect()->route('dashboard')->with('error', $e->getMessage());
        }

        $summary = "GitHub verified — {$stats['public_repos']} repos, {$stats['stars']} stars imported (+{$stats['points_awarded']} rank points).";

        return redirect()->route('dashboard')->with('success', $summary);
    }
}
