<?php

namespace App\Services;

use App\Models\InterviewReview;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Computes the two integrity/reputation scores that were previously declared
 * on the users table but never populated.
 *
 *  - human_score  (candidates): quiz integrity — how much of their AI-analysed
 *    coding work reads as genuinely human.
 *  - trust_score  (companies):  hiring conduct — inverse of their ghosting rate
 *    on the interview board.
 *
 * Both are recomputed on the events that can change them (quiz completion,
 * interview review created / hidden) and can be fully backfilled via
 * `php artisan devrank:recompute-scores`.
 */
class ScoreService
{
    /**
     * human_score (0–100): the percentage of a candidate's AI-analysed (coding)
     * quiz answers that were NOT flagged as AI-written. Candidates with no coding
     * answers default to 100 (presumed genuine — no flags yet).
     */
    public function updateHumanScore(int $userId): float
    {
        $row = DB::table('quiz_answers')
            ->join('quiz_attempts', 'quiz_answers.attempt_id', '=', 'quiz_attempts.id')
            ->join('quiz_questions', 'quiz_answers.question_id', '=', 'quiz_questions.id')
            ->where('quiz_attempts.user_id', $userId)
            ->where('quiz_questions.type', 'coding')
            ->selectRaw('COUNT(*) as total, COALESCE(SUM(quiz_answers.ai_flagged), 0) as flagged')
            ->first();

        $total   = (int) $row->total;
        $flagged = (int) $row->flagged;
        $score   = $total > 0 ? round(100 * ($total - $flagged) / $total, 2) : 100.00;

        User::whereKey($userId)->update(['human_score' => $score]);

        return $score;
    }

    /**
     * trust_score (0–100): 100 minus the percentage of a company's visible
     * interview reviews that report a "ghosted" outcome. Companies with no
     * reviews default to 100. Honest rejections do not reduce trust.
     */
    public function updateTrustScoreForCompany(?string $companyName): void
    {
        if (! $companyName) {
            return;
        }

        $row = InterviewReview::where('company_name', $companyName)
            ->where('status', 'visible')
            ->selectRaw("COUNT(*) as total, COALESCE(SUM(outcome = 'ghosted'), 0) as ghosted")
            ->first();

        $total   = (int) $row->total;
        $ghosted = (int) $row->ghosted;
        $score   = $total > 0 ? (int) round(100 * (1 - $ghosted / $total)) : 100;

        $ids = User::role('company')->where('company_name', $companyName)->pluck('id');
        if ($ids->isNotEmpty()) {
            User::whereIn('id', $ids)->update(['trust_score' => $score]);
        }
    }

    /**
     * Backfill every candidate's human_score and every company's trust_score.
     */
    public function recomputeAll(): array
    {
        $candidateIds = User::role('candidate')->pluck('id');
        foreach ($candidateIds as $id) {
            $this->updateHumanScore($id);
        }

        $companyNames = User::role('company')->whereNotNull('company_name')->distinct()->pluck('company_name');
        foreach ($companyNames as $name) {
            $this->updateTrustScoreForCompany($name);
        }

        return ['candidates' => $candidateIds->count(), 'companies' => $companyNames->count()];
    }
}
