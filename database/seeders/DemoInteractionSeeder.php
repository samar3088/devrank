<?php

namespace Database\Seeders;

use App\Models\InterestRequest;
use App\Models\JobApplication;
use App\Models\JobListing;
use App\Models\ProfileViewLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DemoInteractionSeeder extends Seeder
{
    public function run(): void
    {
        $candidates = User::role('candidate')->get();
        $companies = User::role('company')->get();
        $activeJobs = JobListing::where('status', 'active')->get();
        $allJobs = JobListing::all();

        // ── Job Applications ────────────────────────────
        // Each candidate applies to 2-5 random jobs
        $statuses = ['applied', 'reviewing', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn'];

        foreach ($candidates as $candidate) {
            $numApps = rand(2, 5);
            $jobsToApply = $allJobs->random(min($numApps, $allJobs->count()));

            foreach ($jobsToApply as $job) {
                // Avoid duplicate applications
                $existing = JobApplication::where('jobs_listing_id', $job->id)
                    ->where('user_id', $candidate->id)
                    ->exists();

                if ($existing) continue;

                $appliedAt = $job->published_at->copy()->addDays(rand(1, 15));
                $status = $statuses[array_rand($statuses)];

                JobApplication::create([
                    'jobs_listing_id' => $job->id,
                    'user_id' => $candidate->id,
                    'cover_letter' => $this->randomCoverLetter($candidate->name, $job->title),
                    'status' => $status,
                    'rejection_reason' => $status === 'rejected' ? $this->randomRejectionReason() : null,
                    'company_notes' => in_array($status, ['shortlisted', 'interviewing', 'offered']) ? 'Strong candidate, good fit for the role.' : null,
                    'created_at' => $appliedAt,
                    'updated_at' => $appliedAt,
                ]);
            }
        }

        // ── Interest Requests (Company → Candidate) ─────
        // Each company sends 4-8 interest requests to top candidates
        $interestStatuses = ['pending', 'pending', 'accepted', 'accepted', 'declined'];
        $topCandidates = $candidates->sortByDesc('total_rank_score')->take(20);

        foreach ($companies as $company) {
            $numInterests = rand(4, 8);
            $candidatesToReach = $topCandidates->random(min($numInterests, $topCandidates->count()));

            foreach ($candidatesToReach as $candidate) {
                $existing = InterestRequest::where('company_id', $company->id)
                    ->where('candidate_id', $candidate->id)
                    ->exists();

                if ($existing) continue;

                $sentAt = Carbon::now()->subDays(rand(1, 90));
                $status = $interestStatuses[array_rand($interestStatuses)];

                $interest = InterestRequest::create([
                    'company_id' => $company->id,
                    'candidate_id' => $candidate->id,
                    'message' => $this->randomOutreachMessage($company->company_name, $candidate->name),
                    'role_title' => $this->randomRoleTitle(),
                    'salary_range' => $this->randomSalaryRange(),
                    'location' => $company->location,
                    'status' => $status,
                    'responded_at' => $status !== 'pending' ? $sentAt->copy()->addDays(rand(1, 5)) : null,
                    'profile_viewed_at' => $sentAt->copy()->subDays(rand(1, 3)),
                    'created_at' => $sentAt,
                    'updated_at' => $sentAt,
                ]);

                // ── Profile View Log for each interest ──
                ProfileViewLog::create([
                    'company_id' => $company->id,
                    'candidate_id' => $candidate->id,
                    'interest_request_id' => $interest->id,
                    'view_type' => 'outreach',
                    'ip_address' => '192.168.1.' . rand(1, 254),
                    'created_at' => $sentAt->copy()->subDays(rand(1, 3)),
                ]);
            }
        }

        // ── Additional Profile Views (browsing) ─────────
        // Companies browse candidate profiles
        foreach ($companies as $company) {
            $numViews = rand(8, 15);
            $viewedCandidates = $candidates->random(min($numViews, $candidates->count()));

            foreach ($viewedCandidates as $candidate) {
                ProfileViewLog::create([
                    'company_id' => $company->id,
                    'candidate_id' => $candidate->id,
                    'interest_request_id' => null,
                    'view_type' => 'browse',
                    'ip_address' => '10.0.0.' . rand(1, 254),
                    'created_at' => Carbon::now()->subDays(rand(1, 60)),
                ]);
            }
        }

        // ── Update monthly counters on users ────────────
        foreach ($candidates as $candidate) {
            $monthlyApps = JobApplication::where('user_id', $candidate->id)
                ->where('created_at', '>=', Carbon::now()->startOfMonth())
                ->count();

            $candidate->update(['monthly_job_applications' => $monthlyApps]);
        }

        foreach ($companies as $company) {
            $monthlyPosts = JobListing::where('user_id', $company->id)
                ->where('created_at', '>=', Carbon::now()->startOfMonth())
                ->count();

            $monthlySent = InterestRequest::where('company_id', $company->id)
                ->where('created_at', '>=', Carbon::now()->startOfMonth())
                ->count();

            $company->update([
                'monthly_job_posts' => $monthlyPosts,
                'monthly_outreach_sent' => $monthlySent,
            ]);
        }
    }

    private function randomCoverLetter(string $name, string $jobTitle): string
    {
        $letters = [
            "Hi, I'm {$name} and I'm very excited about the {$jobTitle} role. My experience aligns well with the requirements, and I'd love the opportunity to contribute to your team.",
            "I'm writing to express my interest in the {$jobTitle} position. With my background and skills, I believe I can make a meaningful impact on your team.",
            "The {$jobTitle} role caught my attention because it matches my career goals perfectly. I bring strong technical skills and a passion for building great software.",
            "I've been following your company's work and the {$jobTitle} opportunity is exactly what I've been looking for. I'd love to discuss how I can contribute.",
        ];
        return $letters[array_rand($letters)];
    }

    private function randomRejectionReason(): string
    {
        $reasons = [
            'Position filled by another candidate.',
            'Looking for more experience in the specific tech stack.',
            'Better alignment with another candidate\'s background.',
            'Role requirements changed during the hiring process.',
        ];
        return $reasons[array_rand($reasons)];
    }

    private function randomOutreachMessage(string $companyName, string $candidateName): string
    {
        $messages = [
            "Hi {$candidateName}, we at {$companyName} are impressed by your DevRank profile and forum contributions. We'd love to discuss potential opportunities with you.",
            "{$candidateName}, your technical skills and community contributions on DevRank caught our attention. {$companyName} is hiring and we think you'd be a great fit.",
            "Hello {$candidateName}! {$companyName} is looking for talented developers like you. Your rank score and human-verified answers show genuine expertise.",
            "We noticed your impressive profile on DevRank, {$candidateName}. {$companyName} has exciting roles that match your skills. Would you be open to a conversation?",
        ];
        return $messages[array_rand($messages)];
    }

    private function randomRoleTitle(): string
    {
        $roles = [
            'Senior Frontend Developer', 'Full Stack Engineer', 'Backend Developer',
            'DevOps Engineer', 'Technical Lead', 'React Developer',
            'Node.js Developer', 'Python Developer', 'Software Architect',
        ];
        return $roles[array_rand($roles)];
    }

    private function randomSalaryRange(): string
    {
        $ranges = [
            '₹15-22 LPA', '₹18-25 LPA', '₹20-30 LPA', '₹12-18 LPA',
            '₹25-35 LPA', '₹10-15 LPA', '₹22-28 LPA', '₹30-45 LPA',
        ];
        return $ranges[array_rand($ranges)];
    }
}