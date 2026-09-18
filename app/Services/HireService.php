<?php

namespace App\Services;

use App\Models\HireOutcome;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Verified hire outcomes + salary transparency (#11).
 *
 * A hire is two-sided: the company records it (from the applicant pipeline),
 * then the candidate confirms it happened. Only verified hires count towards a
 * company's public hire record, and real offer figures only reach the public
 * salary-transparency aggregates when the candidate has explicitly opted in.
 */
class HireService
{
    public function __construct(private NotificationService $notifications) {}

    /**
     * Company records a hire for one of their applicants. Idempotent-ish: if an
     * outcome already exists for the application it is returned unchanged.
     *
     * Sets the application to the terminal `hired` stage, stamps the SLA clock
     * (a hire is a response), and notifies the candidate to confirm.
     */
    public function recordHire(JobApplication $application, array $data): HireOutcome
    {
        $application->loadMissing('jobListing');
        $job = $application->jobListing;

        return DB::transaction(function () use ($application, $job, $data) {
            $existing = HireOutcome::where('job_application_id', $application->id)->first();
            if ($existing) {
                return $existing;
            }

            $outcome = HireOutcome::create([
                'job_application_id'   => $application->id,
                'company_id'           => $job->user_id,
                'candidate_id'         => $application->user_id,
                'role_title'           => $job->title,
                'experience_level'     => $job->experience_level,
                'offered_salary'       => $data['offered_salary'] ?? null,
                'salary_currency'      => $data['salary_currency'] ?? ($job->salary_currency ?: 'INR'),
                'salary_period'        => $data['salary_period'] ?? 'yearly',
                'starts_on'            => $data['starts_on'] ?? null,
                'status'               => 'pending',
                'salary_shared'        => false,
                'company_confirmed_at' => now(),
            ]);

            // Move the application to the terminal stage and stop the SLA clock.
            $updates = ['status' => 'hired'];
            if ($application->responded_at === null) {
                $updates['responded_at'] = now();
            }
            $application->update($updates);

            $company = $job->company;
            $this->notifications->notify(
                user:  $application->user_id,
                type:  'hire_recorded',
                title: 'Confirm your new role 🎉',
                body:  Str::limit(($company->company_name ?: $company->name ?? 'A company') . ' marked you as hired for ' . $job->title . '. Confirm to verify it.', 140),
                url:   '/hires',
                icon:  '🎉',
            );

            return $outcome;
        });
    }

    /**
     * Candidate confirms the hire happened. Optionally opts into contributing
     * their (anonymised, aggregate-only) compensation to salary transparency.
     */
    public function confirm(HireOutcome $outcome, bool $shareSalary): void
    {
        if ($outcome->status === 'verified') {
            return;
        }

        $outcome->update([
            'status'                 => 'verified',
            'candidate_confirmed_at' => now(),
            'salary_shared'          => $shareSalary,
        ]);

        $candidate = $outcome->candidate;
        $this->notifications->notify(
            user:  $outcome->company_id,
            type:  'hire_verified',
            title: 'Hire verified ✓',
            body:  Str::limit(($candidate->name ?? 'A candidate') . ' confirmed their hire for ' . $outcome->role_title . '.', 140),
            url:   '/company/jobs/' . $outcome->application->jobs_listing_id . '/applicants',
            icon:  '✓',
        );
    }

    /**
     * Candidate declines: the hire did not happen. The application is returned
     * to the `offered` stage so the pipeline stays honest, and the company is
     * notified.
     */
    public function decline(HireOutcome $outcome): void
    {
        if ($outcome->status === 'declined') {
            return;
        }

        DB::transaction(function () use ($outcome) {
            $outcome->update([
                'status'        => 'declined',
                'salary_shared' => false,
            ]);

            // Roll the pipeline back off the terminal stage.
            $application = $outcome->application;
            if ($application && $application->status === 'hired') {
                $application->update(['status' => 'offered']);
            }

            $candidate = $outcome->candidate;
            $this->notifications->notify(
                user:  $outcome->company_id,
                type:  'hire_declined',
                title: 'Hire not confirmed',
                body:  Str::limit(($candidate->name ?? 'A candidate') . ' indicated the hire for ' . $outcome->role_title . ' did not happen.', 140),
                url:   '/company/jobs/' . $application?->jobs_listing_id . '/applicants',
                icon:  '↩️',
            );
        });
    }

    /**
     * Hire outcomes awaiting this candidate's confirmation, newest first.
     */
    public function pendingForCandidate(int $candidateId)
    {
        return HireOutcome::with('company:id,name,company_name,company_logo')
            ->where('candidate_id', $candidateId)
            ->where('status', 'pending')
            ->latest()
            ->get()
            ->map(fn (HireOutcome $o) => $this->presentForCandidate($o));
    }

    /**
     * Every hire outcome for a candidate (all states) for the /hires page.
     */
    public function forCandidate(int $candidateId)
    {
        return HireOutcome::with('company:id,name,company_name,company_logo')
            ->where('candidate_id', $candidateId)
            ->latest()
            ->get()
            ->map(fn (HireOutcome $o) => $this->presentForCandidate($o));
    }

    private function presentForCandidate(HireOutcome $o): array
    {
        return [
            'id'            => $o->id,
            'company'       => $o->company->company_name ?: $o->company->name ?? 'A company',
            'company_id'    => $o->company_id,
            'role_title'    => $o->role_title,
            'status'        => $o->status,
            'offered_salary'=> $o->offered_salary,
            'salary_currency' => $o->salary_currency,
            'salary_period' => $o->salary_period,
            'salary_shared' => $o->salary_shared,
            'starts_on'     => optional($o->starts_on)->toDateString(),
            'recorded_at'   => optional($o->company_confirmed_at)->diffForHumans(),
        ];
    }

    /**
     * Count of a company's verified hires — a positive, provable trust signal
     * shown on the company profile/dashboard (does not alter the penalty-based
     * trust_score formula).
     */
    public function verifiedHireCount(int $companyId): int
    {
        return HireOutcome::where('company_id', $companyId)->verified()->count();
    }

    /**
     * Aggregate, k-anonymised salary transparency built from verified hires
     * whose candidate opted into sharing. Never exposes an individual figure:
     * every bucket is suppressed until it has `hires.min_sample` data points.
     *
     * Salaries are annualised (monthly × 12) and grouped per currency so figures
     * are never mixed. Returns the largest currency group, plus overall / by
     * experience level / by role breakdowns.
     */
    public function salaryTransparency(): array
    {
        $min = (int) config('devrank.hires.min_sample', 3);

        $rows = HireOutcome::verified()
            ->where('salary_shared', true)
            ->whereNotNull('offered_salary')
            ->get(['offered_salary', 'salary_currency', 'salary_period', 'experience_level', 'role_title']);

        $totalVerified = HireOutcome::verified()->count();

        if ($rows->isEmpty()) {
            return [
                'available'      => false,
                'min_sample'     => $min,
                'shared_count'   => 0,
                'verified_count' => $totalVerified,
            ];
        }

        // Group by currency; report on the currency with the most data points so
        // we never blend, say, INR and USD into one meaningless median.
        $byCurrency = $rows->groupBy('salary_currency')->sortByDesc(fn ($g) => $g->count());
        $currency   = $byCurrency->keys()->first();
        $group      = $byCurrency->first();

        $values = $group->map(fn ($o) => $o->salary_period === 'monthly'
            ? (int) $o->offered_salary * 12
            : (int) $o->offered_salary)->values();

        if ($values->count() < $min) {
            return [
                'available'      => false,
                'min_sample'     => $min,
                'shared_count'   => $rows->count(),
                'verified_count' => $totalVerified,
                'currency'       => $currency,
            ];
        }

        // By experience level (suppress small buckets).
        $byLevel = $group->groupBy(fn ($o) => $o->experience_level ?: 'unspecified')
            ->map(function ($g) use ($min) {
                if ($g->count() < $min) {
                    return null;
                }
                $vals = $g->map(fn ($o) => $o->salary_period === 'monthly' ? (int) $o->offered_salary * 12 : (int) $o->offered_salary);
                return $this->summary($vals) + ['count' => $g->count()];
            })
            ->filter()
            ->map(fn ($s, $level) => $s + ['label' => ucfirst($level)])
            ->values();

        // By role title (normalised, suppress small buckets, top 8).
        $byRole = $group->groupBy(fn ($o) => Str::of($o->role_title)->lower()->trim()->toString())
            ->map(function ($g, $key) use ($min) {
                if ($g->count() < $min) {
                    return null;
                }
                $vals = $g->map(fn ($o) => $o->salary_period === 'monthly' ? (int) $o->offered_salary * 12 : (int) $o->offered_salary);
                return $this->summary($vals) + ['count' => $g->count(), 'label' => $g->first()->role_title];
            })
            ->filter()
            ->sortByDesc('count')
            ->take(8)
            ->values();

        return [
            'available'      => true,
            'min_sample'     => $min,
            'currency'       => $currency,
            'shared_count'   => $values->count(),
            'verified_count' => $totalVerified,
            'overall'        => $this->summary($values) + ['count' => $values->count()],
            'by_level'       => $byLevel,
            'by_role'        => $byRole,
        ];
    }

    /**
     * Median / 25th / 75th percentile / min / max for a set of figures.
     */
    private function summary($values): array
    {
        $sorted = $values->sort()->values();

        return [
            'median' => $this->percentile($sorted, 0.50),
            'p25'    => $this->percentile($sorted, 0.25),
            'p75'    => $this->percentile($sorted, 0.75),
            'min'    => (int) $sorted->first(),
            'max'    => (int) $sorted->last(),
        ];
    }

    /** Linear-interpolated percentile over an already-sorted collection. */
    private function percentile($sorted, float $q): int
    {
        $n = $sorted->count();
        if ($n === 0) {
            return 0;
        }
        if ($n === 1) {
            return (int) $sorted->first();
        }

        $pos   = $q * ($n - 1);
        $lower = (int) floor($pos);
        $upper = (int) ceil($pos);
        $frac  = $pos - $lower;

        return (int) round($sorted[$lower] + ($sorted[$upper] - $sorted[$lower]) * $frac);
    }
}
