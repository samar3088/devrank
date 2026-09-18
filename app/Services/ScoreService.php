<?php

namespace App\Services;

use App\Models\InterviewReview;
use App\Models\JobApplication;
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
     * trust_score (0–100): a company's hiring conduct, blended from two signals:
     *   - ghosting rate on the interview board (matched by company_name), and
     *   - application-response rate — the share of job applications the company
     *     left un-responded past the SLA window (config `devrank.sla.response_days`).
     * Only the signals a company actually has are counted (weighted by
     * `sla.ghost_weight` / `sla.response_weight`), so a company with reviews but
     * no applications scores exactly as it did before this blend existed.
     * Companies with neither signal default to 100. Honest rejections and timely
     * responses do not reduce trust.
     *
     * Interview reviews are name-matched (one report can span multiple accounts
     * sharing a company_name), while application conduct is per account — so we
     * recompute each matching account individually.
     */
    public function updateTrustScoreForCompany(?string $companyName): void
    {
        if (! $companyName) {
            return;
        }

        User::role('company')->where('company_name', $companyName)->get()
            ->each(fn (User $company) => $this->updateTrustScoreForUser($company));
    }

    /**
     * Recompute one company account's trust_score from both conduct signals.
     */
    public function updateTrustScoreForUser(User $company): int
    {
        // Signal 1 — interview-board ghosting (name-matched, honest rejections excluded).
        $ghostRate = null;
        if ($company->company_name) {
            $row = InterviewReview::where('company_name', $company->company_name)
                ->where('status', 'visible')
                ->selectRaw("COUNT(*) as total, COALESCE(SUM(outcome = 'ghosted'), 0) as ghosted")
                ->first();
            if ((int) $row->total > 0) {
                $ghostRate = (int) $row->ghosted / (int) $row->total;
            }
        }

        // Signal 2 — application-response conduct (this account's jobs only).
        $slaRate = $this->applicationBreachRate($company);

        $ghostWeight    = (float) config('devrank.sla.ghost_weight', 0.6);
        $responseWeight = (float) config('devrank.sla.response_weight', 0.4);

        $weighted = 0.0;
        $weightSum = 0.0;
        if ($ghostRate !== null) {
            $weighted  += $ghostRate * $ghostWeight;
            $weightSum += $ghostWeight;
        }
        if ($slaRate !== null) {
            $weighted  += $slaRate * $responseWeight;
            $weightSum += $responseWeight;
        }

        $score = $weightSum > 0 ? (int) round(100 * (1 - $weighted / $weightSum)) : 100;

        $company->update(['trust_score' => $score]);

        return $score;
    }

    /**
     * Share of a company's job applications left un-responded past the SLA
     * window. Withdrawn applications (candidate backed out) are excluded from
     * both sides. Returns null when the company has received no applications.
     */
    public function applicationBreachRate(User $company): ?float
    {
        $jobIds = $company->jobListings()->pluck('id');
        if ($jobIds->isEmpty()) {
            return null;
        }

        $base = JobApplication::whereIn('jobs_listing_id', $jobIds)
            ->where('status', '!=', 'withdrawn');

        $total = (clone $base)->count();
        if ($total === 0) {
            return null;
        }

        $cutoff = now()->subDays((int) config('devrank.sla.response_days', 14));
        $breached = (clone $base)
            ->where('status', 'applied')
            ->whereNull('responded_at')
            ->where('created_at', '<=', $cutoff)
            ->count();

        return $breached / $total;
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

        // Per-account so both signals (ghosting + application-response SLA) are
        // recomputed — this also catches applications that silently crossed the
        // SLA window with no status event to trigger a recompute.
        $companies = User::role('company')->get();
        foreach ($companies as $company) {
            $this->updateTrustScoreForUser($company);
        }

        return ['candidates' => $candidateIds->count(), 'companies' => $companies->count()];
    }
}
