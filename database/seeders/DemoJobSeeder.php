<?php

namespace Database\Seeders;

use App\Models\JobListing;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoJobSeeder extends Seeder
{
    public function run(): void
    {
        // Get company users
        $techVentures = User::where('company_name', 'TechVentures India')->first();
        $innoSoft = User::where('company_name', 'InnoSoft Solutions')->first();

        // ── TechVentures Jobs ───────────────────────────
        $job1 = JobListing::create([
            'user_id' => $techVentures->id,
            'title' => 'Senior React Developer — Remote First',
            'slug' => Str::slug('Senior React Developer Remote First TechVentures'),
            'description' => "We're looking for a Senior React Developer to join our frontend team. You'll be building complex, high-performance web applications used by thousands of users daily.\n\nResponsibilities:\n- Build and maintain React applications with TypeScript\n- Collaborate with designers and backend engineers\n- Write clean, tested, and well-documented code\n- Participate in code reviews and architecture discussions\n- Mentor junior developers",
            'requirements' => "- 3-6 years of experience with React\n- Strong TypeScript skills\n- Experience with Redux or Zustand\n- Familiarity with GraphQL\n- Understanding of web performance optimization\n- Experience with Jest and React Testing Library",
            'benefits' => "- Competitive salary (₹18-24 LPA)\n- Remote-first culture\n- Health insurance for family\n- Learning budget ₹50K/year\n- Flexible working hours\n- Annual team retreats",
            'job_type' => 'full-time',
            'work_mode' => 'remote',
            'location' => 'Remote / Bengaluru',
            'experience_level' => 'senior',
            'experience_range' => '3-6 years',
            'salary_min' => 1800000,
            'salary_max' => 2400000,
            'salary_currency' => 'INR',
            'salary_period' => 'yearly',
            'status' => 'active',
            'is_featured' => true,
            'published_at' => now()->subDays(3),
            'expires_at' => now()->addDays(27),
        ]);

        $job2 = JobListing::create([
            'user_id' => $techVentures->id,
            'title' => 'Backend Engineer — Laravel / PHP',
            'slug' => Str::slug('Backend Engineer Laravel PHP TechVentures'),
            'description' => "Join our backend team to build scalable APIs and services that power our platform. We use Laravel as our primary framework.\n\nResponsibilities:\n- Design and implement RESTful APIs\n- Optimize database queries and performance\n- Implement authentication and authorization\n- Write unit and integration tests\n- Collaborate with frontend team on API contracts",
            'requirements' => "- 2-4 years of experience with Laravel/PHP\n- Strong MySQL/PostgreSQL skills\n- Understanding of queue systems (Redis, RabbitMQ)\n- Experience with API design patterns\n- Knowledge of Docker basics\n- Familiarity with CI/CD pipelines",
            'benefits' => "- Salary: ₹12-18 LPA\n- Hybrid work (3 days office)\n- Health insurance\n- Annual performance bonus\n- Conference attendance budget",
            'job_type' => 'full-time',
            'work_mode' => 'hybrid',
            'location' => 'Bengaluru',
            'experience_level' => 'mid',
            'experience_range' => '2-4 years',
            'salary_min' => 1200000,
            'salary_max' => 1800000,
            'salary_currency' => 'INR',
            'salary_period' => 'yearly',
            'status' => 'active',
            'is_featured' => false,
            'published_at' => now()->subDays(5),
            'expires_at' => now()->addDays(25),
        ]);

        // ── InnoSoft Jobs ───────────────────────────────
        $job3 = JobListing::create([
            'user_id' => $innoSoft->id,
            'title' => 'Lead Full Stack Engineer — React + Node.js',
            'slug' => Str::slug('Lead Full Stack Engineer React Node InnoSoft'),
            'description' => "We're looking for a Lead Engineer to architect and build our next-generation SaaS platform. You'll lead a team of 4 engineers.\n\nResponsibilities:\n- Lead architecture decisions for the platform\n- Build features end-to-end (React frontend + Node.js backend)\n- Conduct code reviews and establish coding standards\n- Mentor team members and drive technical growth\n- Collaborate directly with product and design",
            'requirements' => "- 5-8 years of full stack experience\n- Expert in React and Node.js/Express\n- Experience leading a small team\n- Strong system design skills\n- Experience with MongoDB and Redis\n- AWS experience (EC2, S3, Lambda)\n- Excellent communication skills",
            'benefits' => "- Salary: ₹22-30 LPA\n- ESOPs\n- Hybrid work (Pune)\n- Premium health insurance\n- ₹1L annual learning budget\n- MacBook Pro provided",
            'job_type' => 'full-time',
            'work_mode' => 'hybrid',
            'location' => 'Pune',
            'experience_level' => 'lead',
            'experience_range' => '5-8 years',
            'salary_min' => 2200000,
            'salary_max' => 3000000,
            'salary_currency' => 'INR',
            'salary_period' => 'yearly',
            'status' => 'active',
            'is_featured' => true,
            'published_at' => now()->subDays(1),
            'expires_at' => now()->addDays(29),
        ]);

        $job4 = JobListing::create([
            'user_id' => $innoSoft->id,
            'title' => 'Junior Python Developer — Internship to Full-time',
            'slug' => Str::slug('Junior Python Developer Internship InnoSoft'),
            'description' => "Great opportunity for freshers! Start as an intern and transition to full-time based on performance. You'll work on our data pipeline and automation tools.\n\nResponsibilities:\n- Build Python scripts for data processing\n- Assist in API development with Django/FastAPI\n- Write automated tests\n- Learn and grow with senior mentors",
            'requirements' => "- 0-1 years of experience (freshers welcome)\n- Basic Python knowledge\n- Understanding of SQL\n- Willingness to learn\n- Good problem-solving skills\n- BTech/BCA/MCA or equivalent",
            'benefits' => "- Stipend: ₹25K/month (internship)\n- Full-time salary: ₹4-6 LPA after confirmation\n- Mentorship program\n- Certificate on completion\n- Flexible hours",
            'job_type' => 'internship',
            'work_mode' => 'onsite',
            'location' => 'Pune',
            'experience_level' => 'junior',
            'experience_range' => '0-1 years',
            'salary_min' => 400000,
            'salary_max' => 600000,
            'salary_currency' => 'INR',
            'salary_period' => 'yearly',
            'status' => 'active',
            'is_featured' => false,
            'published_at' => now()->subDays(7),
            'expires_at' => now()->addDays(23),
        ]);

        // ── Attach Tags to Jobs ─────────────────────────
        $react = Tag::where('slug', 'react')->first();
        $typescript = Tag::where('slug', 'typescript')->first();
        $redux = Tag::where('slug', 'redux')->first();
        $graphql = Tag::where('slug', 'graphql')->first();
        $laravel = Tag::where('slug', 'laravel')->first();
        $php = Tag::where('slug', 'php')->first();
        $mysql = Tag::where('slug', 'mysql')->first();
        $docker = Tag::where('slug', 'docker')->first();
        $nodejs = Tag::where('slug', 'node-js')->first();
        $mongodb = Tag::where('slug', 'mongodb')->first();
        $aws = Tag::where('slug', 'aws')->first();
        $python = Tag::where('slug', 'python')->first();
        $sql = Tag::where('slug', 'sql')->first();
        $systemDesign = Tag::where('slug', 'system-design')->first();

        // Attach (only if tag exists)
        $job1->tags()->syncWithoutDetaching(
            collect([$react, $typescript, $redux, $graphql])->filter()->pluck('id')
        );
        $job2->tags()->syncWithoutDetaching(
            collect([$laravel, $php, $mysql, $docker])->filter()->pluck('id')
        );
        $job3->tags()->syncWithoutDetaching(
            collect([$react, $nodejs, $mongodb, $aws, $systemDesign])->filter()->pluck('id')
        );
        $job4->tags()->syncWithoutDetaching(
            collect([$python, $sql])->filter()->pluck('id')
        );
    }
}