<?php

namespace Database\Seeders;

use App\Models\HireOutcome;
use App\Models\JobApplication;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Seeds a handful of verified hire outcomes (#11) so the public salary
 * transparency page (/salaries) shows real aggregate bands out of the box,
 * and company profiles show a non-zero verified-hire count. Runs after
 * DemoInteractionSeeder (which creates the applications these attach to).
 */
class DemoHireSeeder extends Seeder
{
    public function run(): void
    {
        // Realistic annual INR bands by experience level (in rupees).
        $bands = [
            'junior'    => [800000, 1400000],
            'mid'       => [1500000, 2600000],
            'senior'    => [2600000, 4200000],
            'lead'      => [3800000, 6000000],
            'principal' => [5000000, 8000000],
        ];

        // Pull applications that reached a late stage; convert a subset to hires.
        $candidates = JobApplication::whereIn('status', ['offered', 'interview', 'shortlisted'])
            ->whereDoesntHave('hireOutcome')
            ->with('jobListing:id,user_id,title,experience_level,salary_currency')
            ->inRandomOrder()
            ->limit(14)
            ->get()
            ->filter(fn ($app) => $app->jobListing !== null);

        foreach ($candidates as $app) {
            $job   = $app->jobListing;
            $level = $job->experience_level && isset($bands[$job->experience_level])
                ? $job->experience_level
                : 'mid';
            [$lo, $hi] = $bands[$level];

            // Round to the nearest 50k for tidy figures.
            $salary = (int) (round(rand($lo, $hi) / 50000) * 50000);

            $confirmedAt = Carbon::now()->subDays(rand(3, 45));

            HireOutcome::create([
                'job_application_id'     => $app->id,
                'company_id'             => $job->user_id,
                'candidate_id'           => $app->user_id,
                'role_title'             => $job->title,
                'experience_level'       => $level,
                'offered_salary'         => $salary,
                'salary_currency'        => 'INR',
                'salary_period'          => 'yearly',
                'starts_on'              => $confirmedAt->copy()->addDays(rand(14, 45))->toDateString(),
                'status'                 => 'verified',
                // Most confirmed candidates opt into sharing (some don't).
                'salary_shared'          => rand(1, 10) > 2,
                'company_confirmed_at'   => $confirmedAt->copy()->subDays(rand(1, 4)),
                'candidate_confirmed_at' => $confirmedAt,
                'created_at'             => $confirmedAt->copy()->subDays(rand(1, 4)),
                'updated_at'             => $confirmedAt,
            ]);

            // Reflect the hire in the pipeline (terminal stage) + stop SLA clock.
            $app->update([
                'status'       => 'hired',
                'responded_at' => $app->responded_at ?? $confirmedAt->copy()->subDays(rand(1, 4)),
            ]);
        }
    }
}
