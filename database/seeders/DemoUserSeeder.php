<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Candidates ──────────────────────────────────
        $candidates = [
            [
                'name' => 'Arjun Kumar',
                'email' => 'arjun@devrank.com',
                'headline' => 'Senior React Developer',
                'location' => 'Bengaluru',
                'experience_level' => 'senior',
                'years_of_experience' => 6,
                'open_to_work' => true,
                'preferred_job_type' => 'full-time',
                'total_rank_score' => 4820,
                'human_score' => 96.00,
            ],
            [
                'name' => 'Priya Sharma',
                'email' => 'priya@devrank.com',
                'headline' => 'Full Stack Node.js Developer',
                'location' => 'Mumbai',
                'experience_level' => 'senior',
                'years_of_experience' => 5,
                'open_to_work' => true,
                'preferred_job_type' => 'full-time',
                'total_rank_score' => 4610,
                'human_score' => 94.00,
            ],
            [
                'name' => 'Rohan Verma',
                'email' => 'rohan@devrank.com',
                'headline' => 'Laravel Backend Engineer',
                'location' => 'Hyderabad',
                'experience_level' => 'mid',
                'years_of_experience' => 4,
                'open_to_work' => true,
                'preferred_job_type' => 'full-time',
                'total_rank_score' => 4390,
                'human_score' => 91.00,
            ],
            [
                'name' => 'Meera Nair',
                'email' => 'meera@devrank.com',
                'headline' => 'System Design Specialist',
                'location' => 'Pune',
                'experience_level' => 'senior',
                'years_of_experience' => 7,
                'open_to_work' => false,
                'preferred_job_type' => 'contract',
                'total_rank_score' => 4205,
                'human_score' => 89.00,
            ],
            [
                'name' => 'Siddharth Khan',
                'email' => 'siddharth@devrank.com',
                'headline' => 'DevOps & AWS Engineer',
                'location' => 'Delhi',
                'experience_level' => 'mid',
                'years_of_experience' => 4,
                'open_to_work' => true,
                'preferred_job_type' => 'full-time',
                'total_rank_score' => 4120,
                'human_score' => 93.00,
            ],
        ];

        foreach ($candidates as $data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('Demo@123'),
                'email_verified_at' => now(),
                'headline' => $data['headline'],
                'location' => $data['location'],
                'experience_level' => $data['experience_level'],
                'years_of_experience' => $data['years_of_experience'],
                'open_to_work' => $data['open_to_work'],
                'preferred_job_type' => $data['preferred_job_type'],
                'total_rank_score' => $data['total_rank_score'],
                'human_score' => $data['human_score'],
                'is_active' => true,
            ]);
            $user->assignRole('candidate');
        }

        // ── Companies ───────────────────────────────────
        $companies = [
            [
                'name' => 'Harshit Rao',
                'email' => 'harshit@techventures.com',
                'company_name' => 'TechVentures India',
                'company_website' => 'https://techventures.in',
                'company_size' => '51-200',
                'industry' => 'IT Services & Consulting',
                'company_description' => 'TechVentures India is a leading IT services company specializing in web and mobile application development, cloud solutions, and digital transformation.',
                'trust_score' => 91,
                'location' => 'Bengaluru',
            ],
            [
                'name' => 'Neha Gupta',
                'email' => 'neha@innosoft.com',
                'company_name' => 'InnoSoft Solutions',
                'company_website' => 'https://innosoft.io',
                'company_size' => '11-50',
                'industry' => 'Product / SaaS',
                'company_description' => 'InnoSoft Solutions builds SaaS products for HR tech and recruitment automation. We believe in transparent hiring and developer-first culture.',
                'trust_score' => 84,
                'location' => 'Pune',
            ],
        ];

        foreach ($companies as $data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('Demo@123'),
                'email_verified_at' => now(),
                'company_name' => $data['company_name'],
                'company_website' => $data['company_website'],
                'company_size' => $data['company_size'],
                'industry' => $data['industry'],
                'company_description' => $data['company_description'],
                'trust_score' => $data['trust_score'],
                'location' => $data['location'],
                'is_active' => true,
            ]);
            $user->assignRole('company');
        }
    }
}