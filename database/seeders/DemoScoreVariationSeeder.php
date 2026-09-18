<?php

namespace Database\Seeders;

use App\Models\InterviewReview;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\Reply;
use App\Models\User;
use App\Services\ScoreService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Seeds variety into the two integrity/reputation scores (and forum points) so
 * the leaderboard, profiles and job board show meaningful, non-flat values on
 * staging instead of everyone sitting at 100.
 */
class DemoScoreVariationSeeder extends Seeder
{
    public function run(): void
    {
        $candidates = User::role('candidate')->pluck('id')->all();
        if (empty($candidates)) {
            return;
        }
        $author = fn ($i) => $candidates[$i % count($candidates)];

        // ── trust_score: reviews for REAL companies with varied ghosting ──
        // company_name => list of outcomes (only ghosting lowers trust)
        $companyOutcomes = [
            'TechVentures India'      => ['selected', 'selected'],            // 100
            'InnoSoft Solutions'      => ['selected', 'ghosted'],            // 50
            'CloudNine Technologies'  => ['selected', 'selected', 'selected', 'ghosted'], // 75
            'PixelCraft Studios'      => ['rejected', 'ghosted', 'ghosted'], // ~33
            'DataLogic AI'            => ['selected', 'rejected'],           // 100
        ];

        $i = 0;
        foreach ($companyOutcomes as $company => $outcomes) {
            foreach ($outcomes as $outcome) {
                $createdAt = Carbon::now()->subDays(rand(3, 80));
                InterviewReview::create([
                    'user_id'           => $author($i++),
                    'company_name'      => $company,
                    'role_applied'      => ['Backend Engineer', 'Frontend Engineer', 'Full Stack Developer', 'DevOps Engineer'][$i % 4],
                    'interview_date'    => $createdAt->copy()->subDays(rand(7, 30)),
                    'rounds_count'      => rand(2, 4),
                    'rounds_detail'     => [
                        ['type' => 'Screening (30 min)', 'difficulty' => 'easy', 'description' => 'Background + fundamentals'],
                        ['type' => 'Technical (60 min)', 'difficulty' => 'medium', 'description' => 'Core problem solving'],
                    ],
                    'outcome'           => $outcome,
                    'difficulty_rating' => rand(2, 5),
                    'experience_rating' => $outcome === 'ghosted' ? rand(1, 2) : rand(3, 5),
                    'tips'              => $outcome === 'ghosted'
                        ? 'Completed the rounds but never heard back — no closure.'
                        : 'Straightforward process, clear communication throughout.',
                    'status'            => 'visible',
                    'created_at'        => $createdAt,
                    'updated_at'        => $createdAt,
                ]);
            }
        }

        // ── human_score: completed coding attempts, some AI-flagged ──
        $codingQuestion = QuizQuestion::where('type', 'coding')->first();
        if ($codingQuestion) {
            // candidate index => [total coding answers, how many flagged]  → human_score
            $profiles = [
                0 => [2, 0],  // 100%
                1 => [2, 1],  // 50%
                2 => [1, 1],  // 0%
                3 => [3, 1],  // ~67%
                5 => [2, 2],  // 0%
            ];

            foreach ($profiles as $idx => [$total, $flagged]) {
                $userId = $candidates[$idx % count($candidates)];
                for ($n = 1; $n <= $total; $n++) {
                    $isFlagged = $n <= $flagged;
                    $attempt = QuizAttempt::create([
                        'user_id'             => $userId,
                        'quiz_id'             => $codingQuestion->quiz_id,
                        'attempt_number'      => $n,
                        'status'              => 'completed',
                        'score'               => $isFlagged ? 0 : 10,
                        'percentage'          => $isFlagged ? 0 : 100,
                        'passed'              => ! $isFlagged,
                        'ai_flagged'          => $isFlagged,
                        'rank_points_awarded' => $isFlagged ? 0 : 40,
                        'time_taken_seconds'  => rand(300, 1200),
                        'started_at'          => now()->subDays($n),
                        'completed_at'        => now()->subDays($n),
                    ]);

                    QuizAnswer::create([
                        'attempt_id'         => $attempt->id,
                        'question_id'        => $codingQuestion->id,
                        'answer_text'        => $isFlagged ? '// (generated-looking answer)' : '// hand-written solution',
                        'is_correct'         => ! $isFlagged,
                        'marks_awarded'      => $isFlagged ? 0 : 10,
                        'ai_score'           => $isFlagged ? 8.5 : 1.5,
                        'ai_flagged'         => $isFlagged,
                        'paste_count'        => $isFlagged ? rand(2, 5) : 0,
                        'time_spent_seconds' => rand(120, 600),
                    ]);
                }
            }
        }

        // ── forum points: reflect existing forum activity in rank score ──
        $replyPts  = (int) config('devrank.points.reply_posted', 5);
        $acceptPts = (int) config('devrank.points.answer_accepted', 50);
        foreach (Reply::where('status', 'visible')->get(['user_id', 'is_accepted']) as $reply) {
            $pts = $replyPts + ($reply->is_accepted ? $acceptPts : 0);
            User::where('id', $reply->user_id)->increment('total_rank_score', $pts);
        }

        // A few candidates opt into bias-reduced "anonymous" mode (#3) so the
        // feature is visible in a fresh demo (identity masked in discovery).
        \App\Models\User::role('candidate')->inRandomOrder()->take(3)
            ->update(['anonymous' => true]);

        // ── recompute the derived scores from everything above ──
        app(ScoreService::class)->recomputeAll();

        $this->command->info('DemoScoreVariationSeeder: seeded trust/human/forum variation and recomputed scores.');
    }
}
