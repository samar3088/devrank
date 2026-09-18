<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Contracts\User as SocialiteUser;

/**
 * Imports a candidate's real GitHub contribution signals as a verified rank
 * source, bootstrapping rank from work they've already done (roadmap #6).
 *
 * Points use the delta model (like quiz ranking): re-importing refreshes the
 * snapshot and only banks the *change*, so a candidate can't farm points by
 * reconnecting. Every earned point maps to a real, verifiable public signal.
 */
class GithubImportService
{
    /**
     * Link a verified GitHub account to a candidate, import stats, and bank the
     * point delta. Returns the stored stats. Throws on identity conflict.
     */
    public function linkAndImport(User $user, SocialiteUser $github): array
    {
        // Guard: a GitHub identity can only be linked to one DevRank account.
        $conflict = User::where('github_id', (string) $github->getId())
            ->where('id', '!=', $user->id)
            ->exists();
        if ($conflict) {
            throw new \RuntimeException('This GitHub account is already linked to another DevRank profile.');
        }

        $raw = (array) ($github->user ?? []);
        $publicRepos = (int) ($raw['public_repos'] ?? 0);
        $followers   = (int) ($raw['followers'] ?? 0);

        // Stars received + top language need the repo list; degrade gracefully.
        [$stars, $topLanguage] = $this->fetchRepoSignals($github->token ?? null, $github->getNickname());

        $points = $this->computePoints($publicRepos, $stars, $followers);

        $previousAwarded = (int) ($user->github_stats['points_awarded'] ?? 0);

        $stats = [
            'public_repos'   => $publicRepos,
            'followers'      => $followers,
            'stars'          => $stars,
            'top_language'   => $topLanguage,
            'points_awarded' => $points,
            'imported_at'    => now()->toIso8601String(),
        ];

        DB::transaction(function () use ($user, $github, $stats, $points, $previousAwarded, $raw) {
            $user->forceFill([
                'github_id'          => (string) $github->getId(),
                'github_username'    => $github->getNickname(),
                'github_url'         => $raw['html_url'] ?? $user->github_url,
                'github_verified_at' => now(),
                'github_stats'       => $stats,
            ])->save();

            // Bank only the delta vs. what this source previously contributed.
            $delta = $points - $previousAwarded;
            if ($delta !== 0) {
                $user->increment('total_rank_score', max($delta, -$user->total_rank_score));
            }
        });

        return $stats;
    }

    /**
     * Sum stargazers and find the most common primary language across the
     * candidate's public repos. Returns [stars, topLanguage]. Never throws —
     * on API failure returns [0, null] so verification still succeeds.
     */
    private function fetchRepoSignals(?string $token, ?string $nickname): array
    {
        if (! $nickname) {
            return [0, null];
        }

        try {
            // Public endpoint — no OAuth scope needed. The token (when present)
            // only raises the rate limit from 60 to 5000 req/hr.
            $request = Http::acceptJson()->timeout(10);
            if ($token) {
                $request = $request->withToken($token);
            }
            $response = $request->get("https://api.github.com/users/{$nickname}/repos", [
                'per_page' => 100,
                'sort'     => 'pushed',
                'type'     => 'owner',
            ]);

            if (! $response->successful()) {
                return [0, null];
            }

            $stars = 0;
            $langCounts = [];
            foreach ($response->json() as $repo) {
                if (! empty($repo['fork'])) {
                    continue; // forks aren't the candidate's own contribution
                }
                $stars += (int) ($repo['stargazers_count'] ?? 0);
                if (! empty($repo['language'])) {
                    $langCounts[$repo['language']] = ($langCounts[$repo['language']] ?? 0) + 1;
                }
            }

            $topLanguage = null;
            if ($langCounts) {
                arsort($langCounts);
                $topLanguage = array_key_first($langCounts);
            }

            return [$stars, $topLanguage];
        } catch (\Throwable $e) {
            Log::warning('GitHub repo import failed: ' . $e->getMessage());
            return [0, null];
        }
    }

    /**
     * Capped point model — a verification bonus plus bounded credit for repos,
     * stars and followers, so real work is rewarded without letting one big
     * account outweigh earned platform activity.
     */
    private function computePoints(int $repos, int $stars, int $followers): int
    {
        $cfg = config('devrank.github.points');
        $base = (int) config('devrank.points.github_verified', 50);

        $repoPts     = min($repos * $cfg['per_repo'], $cfg['max_repo_points']);
        $starPts      = min(intdiv($stars, 10) * $cfg['per_10_stars'], $cfg['max_star_points']);
        $followerPts = min(intdiv($followers, 10) * $cfg['per_10_followers'], $cfg['max_follower_points']);

        return $base + $repoPts + $starPts + $followerPts;
    }
}
