<?php

namespace App\Services;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Season;
use App\Models\SeasonScore;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Seasons, leagues & weekly challenges (#8). A season is a time-boxed
 * competition; weekly challenges are quizzes flagged live for a window and tied
 * to the season. Season points = the sum of a candidate's BEST percentage per
 * challenge in the season (so retakes bank improvement, never double-count).
 * Leagues are tiers derived from season rank.
 */
class SeasonService
{
    public function current(): ?Season
    {
        return Season::current();
    }

    /**
     * Recompute a candidate's season score after they complete a challenge.
     * Idempotent — always derived from their best attempts, so safe on retakes.
     */
    public function awardForAttempt(QuizAttempt $attempt): void
    {
        $season = $this->current();
        if (! $season) {
            return;
        }

        $quiz = $attempt->quiz;
        if (! $quiz || ! $quiz->is_challenge || (int) $quiz->season_id !== $season->id) {
            return;
        }

        $this->recompute($attempt->user_id, $season);
    }

    /** Derive (season_id, user) score from best attempt per season challenge. */
    public function recompute(int $userId, Season $season): void
    {
        $challengeIds = Quiz::where('is_challenge', true)->where('season_id', $season->id)->pluck('id');
        if ($challengeIds->isEmpty()) {
            return;
        }

        $best = QuizAttempt::where('user_id', $userId)
            ->whereIn('quiz_id', $challengeIds)
            ->where('status', 'completed')
            ->selectRaw('quiz_id, MAX(percentage) as best')
            ->groupBy('quiz_id')
            ->pluck('best');

        SeasonScore::updateOrCreate(
            ['season_id' => $season->id, 'user_id' => $userId],
            ['points' => (int) round($best->sum()), 'challenges_completed' => $best->count()],
        );
    }

    /** League tier from a 1-based rank within the field. */
    public function league(int $rank, int $total): string
    {
        if ($total === 0) {
            return 'Bronze';
        }
        $pct = $rank / $total;
        return $pct <= 0.10 ? 'Gold' : ($pct <= 0.35 ? 'Silver' : 'Bronze');
    }

    /** Season leaderboard with league tiers. */
    public function leaderboard(Season $season, int $limit = 25): array
    {
        $rows = SeasonScore::with('user:id,name,avatar,headline')
            ->where('season_id', $season->id)
            ->where('points', '>', 0)
            ->orderByDesc('points')
            ->orderBy('updated_at')
            ->limit($limit)
            ->get();

        $total = SeasonScore::where('season_id', $season->id)->where('points', '>', 0)->count();

        return $rows->values()->map(fn ($row, $i) => [
            'rank'       => $i + 1,
            'league'     => $this->league($i + 1, $total),
            'name'       => $row->user->name ?? 'Unknown',
            'headline'   => $row->user->headline,
            'user_id'    => $row->user_id,
            'points'     => (int) $row->points,
            'challenges' => (int) $row->challenges_completed,
        ])->all();
    }

    /** Challenge quizzes that are live right now in a season. */
    public function activeChallenges(Season $season): array
    {
        return Quiz::with('tag:id,name,slug')
            ->where('is_challenge', true)
            ->where('season_id', $season->id)
            ->where('status', 'published')
            ->where(fn ($q) => $q->whereNull('challenge_starts_at')->orWhere('challenge_starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('challenge_ends_at')->orWhere('challenge_ends_at', '>=', now()))
            ->orderBy('challenge_ends_at')
            ->get()
            ->map(fn ($q) => [
                'title'      => $q->title,
                'slug'       => $q->slug,
                'difficulty' => $q->difficulty,
                'tag'        => $q->tag?->name,
                'ends_at'    => optional($q->challenge_ends_at)->toIso8601String(),
            ])->all();
    }

    /** A single candidate's standing in the current season (or null). */
    public function standingFor(int $userId, Season $season): ?array
    {
        $score = SeasonScore::where('season_id', $season->id)->where('user_id', $userId)->first();
        if (! $score || $score->points === 0) {
            return null;
        }

        $rank = SeasonScore::where('season_id', $season->id)
            ->where('points', '>', $score->points)->count() + 1;
        $total = SeasonScore::where('season_id', $season->id)->where('points', '>', 0)->count();

        return [
            'rank'       => $rank,
            'league'     => $this->league($rank, $total),
            'points'     => (int) $score->points,
            'challenges' => (int) $score->challenges_completed,
        ];
    }
}
