<?php

namespace Database\Seeders;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Season;
use App\Models\User;
use App\Services\SeasonService;
use Illuminate\Database\Seeder;

class SeasonSeeder extends Seeder
{
    public function run(): void
    {
        // A current, active season.
        $season = Season::create([
            'name'      => 'Autumn 2026 Season',
            'starts_at' => now()->subDays(10),
            'ends_at'   => now()->addDays(20),
            'is_active' => true,
        ]);

        // Turn a couple of existing published quizzes into live weekly challenges.
        $challenges = Quiz::where('status', 'published')->take(2)->get();
        foreach ($challenges as $quiz) {
            $quiz->update([
                'is_challenge'        => true,
                'season_id'           => $season->id,
                'challenge_starts_at' => now()->subDays(3),
                'challenge_ends_at'   => now()->addDays(7),
            ]);
        }

        // Backfill season scores from any completed attempts on those challenges.
        $service = app(SeasonService::class);
        QuizAttempt::whereIn('quiz_id', $challenges->pluck('id'))
            ->where('status', 'completed')
            ->pluck('user_id')->unique()
            ->each(fn ($userId) => $service->recompute($userId, $season));

        // Give the demo board some life: award a handful of candidates.
        User::role('candidate')->inRandomOrder()->take(8)->get()->each(function ($u) use ($season) {
            \App\Models\SeasonScore::updateOrCreate(
                ['season_id' => $season->id, 'user_id' => $u->id],
                ['points' => rand(40, 190), 'challenges_completed' => rand(1, 2)],
            );
        });

        $this->command->info('SeasonSeeder: active season + ' . $challenges->count() . ' live challenges.');
    }
}
