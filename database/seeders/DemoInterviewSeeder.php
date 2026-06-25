<?php

namespace Database\Seeders;

use App\Models\InterviewReview;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DemoInterviewSeeder extends Seeder
{
    public function run(): void
    {
        $candidates = User::role('candidate')->pluck('id')->all();
        if (empty($candidates)) {
            return;
        }

        $reviews = [
            [
                'company_name' => 'TechVentures India', 'role_applied' => 'Senior React Developer',
                'outcome' => 'selected', 'difficulty_rating' => 4, 'experience_rating' => 5,
                'rounds_detail' => [
                    ['type' => 'DevRank Screening (30 min)', 'difficulty' => 'easy', 'description' => 'Technical aptitude + communication'],
                    ['type' => 'React deep-dive (60 min)', 'difficulty' => 'medium', 'description' => 'useMemo, useCallback, state management'],
                    ['type' => 'System Design (45 min)', 'difficulty' => 'hard', 'description' => 'Design a real-time notification system'],
                    ['type' => 'HR / Culture fit (30 min)', 'difficulty' => 'easy', 'description' => 'Salary negotiation, team values'],
                ],
                'tips' => 'Be thorough with React performance — they asked me to live-debug a real component with the profiler. They care more about your approach than perfect solutions. Know your salary expectations upfront.',
                'likes_count' => 34, 'days_ago' => 92,
            ],
            [
                'company_name' => 'Infosys BPM', 'role_applied' => 'Backend Engineer',
                'outcome' => 'rejected', 'difficulty_rating' => 3, 'experience_rating' => 4,
                'rounds_detail' => [
                    ['type' => 'DSA round (60 min)', 'difficulty' => 'medium', 'description' => 'Arrays, linked lists, nothing crazy'],
                    ['type' => 'Node.js deep-dive (45 min)', 'difficulty' => 'hard', 'description' => 'Event loop, async/await, stream handling'],
                    ['type' => 'Managerial (30 min)', 'difficulty' => 'easy', 'description' => 'Past projects and team fit'],
                ],
                'tips' => 'Standard DSA in round 1. Round 2 was Node.js specific. Got honest feedback on rejection which was appreciated — brush up on production-scale systems.',
                'likes_count' => 28, 'days_ago' => 30,
            ],
            [
                'company_name' => 'FinTech Dynamics', 'role_applied' => 'DevOps Engineer',
                'outcome' => 'ghosted', 'difficulty_rating' => 3, 'experience_rating' => 2,
                'rounds_detail' => [
                    ['type' => 'Recruiter call (20 min)', 'difficulty' => 'easy', 'description' => 'Background and expectations'],
                    ['type' => 'Take-home assignment (4 hrs)', 'difficulty' => 'medium', 'description' => 'CI/CD pipeline + IaC task'],
                ],
                'tips' => 'Completed 2 rounds including a 4-hour take-home. No response since — it has been 3 weeks. The tech team seemed great, sadly.',
                'likes_count' => 61, 'days_ago' => 14,
            ],
            [
                'company_name' => 'WebPro Solutions', 'role_applied' => 'Full Stack Developer',
                'outcome' => 'selected', 'difficulty_rating' => 3, 'experience_rating' => 4,
                'rounds_detail' => [
                    ['type' => 'Online test (45 min)', 'difficulty' => 'medium', 'description' => 'JS + SQL fundamentals'],
                    ['type' => 'Pair programming (60 min)', 'difficulty' => 'medium', 'description' => 'Build a small CRUD feature live'],
                    ['type' => 'Founder chat (30 min)', 'difficulty' => 'easy', 'description' => 'Vision and role expectations'],
                ],
                'tips' => 'Pairing round is the make-or-break. Talk through your thinking out loud and write clean, readable code over clever one-liners.',
                'likes_count' => 19, 'days_ago' => 7,
            ],
            [
                'company_name' => 'TechVentures India', 'role_applied' => 'Frontend Engineer',
                'outcome' => 'rejected', 'difficulty_rating' => 4, 'experience_rating' => 3,
                'rounds_detail' => [
                    ['type' => 'Screening (30 min)', 'difficulty' => 'easy', 'description' => 'Resume + JS basics'],
                    ['type' => 'CSS + layout challenge (45 min)', 'difficulty' => 'hard', 'description' => 'Pixel-perfect responsive build'],
                ],
                'tips' => 'The CSS round is tougher than you expect. Practice flexbox/grid edge cases and responsive breakpoints.',
                'likes_count' => 12, 'days_ago' => 21,
            ],
            [
                'company_name' => 'CloudNova Labs', 'role_applied' => 'Platform Engineer',
                'outcome' => 'selected', 'difficulty_rating' => 5, 'experience_rating' => 5,
                'rounds_detail' => [
                    ['type' => 'Systems screening (45 min)', 'difficulty' => 'medium', 'description' => 'Linux, networking, containers'],
                    ['type' => 'Design round (60 min)', 'difficulty' => 'hard', 'description' => 'Design a multi-region deployment'],
                    ['type' => 'Behavioral (30 min)', 'difficulty' => 'easy', 'description' => 'Ownership and incident handling'],
                ],
                'tips' => 'Deep systems knowledge matters here. Be ready to reason about failure modes and trade-offs, not just happy paths.',
                'likes_count' => 47, 'days_ago' => 3,
            ],
        ];

        foreach ($reviews as $i => $r) {
            $createdAt = Carbon::now()->subDays($r['days_ago']);
            InterviewReview::create([
                'user_id'           => $candidates[$i % count($candidates)],
                'company_name'      => $r['company_name'],
                'role_applied'      => $r['role_applied'],
                'interview_date'    => $createdAt->copy()->subDays(rand(7, 30)),
                'rounds_count'      => count($r['rounds_detail']),
                'rounds_detail'     => $r['rounds_detail'],
                'outcome'           => $r['outcome'],
                'difficulty_rating' => $r['difficulty_rating'],
                'experience_rating' => $r['experience_rating'],
                'tips'              => $r['tips'],
                'status'            => 'visible',
                'likes_count'       => $r['likes_count'],
                'created_at'        => $createdAt,
                'updated_at'        => $createdAt,
            ]);
        }

        $this->command->info('DemoInterviewSeeder: ' . count($reviews) . ' interview reviews created.');
    }
}
