<?php

namespace Database\Seeders;

use App\Models\JobListing;
use App\Models\Tag;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoJobSeeder extends Seeder
{
    public function run(): void
    {
        $companies = User::role('company')->get();
        $tags = Tag::where('status', 'approved')->get()->keyBy('slug');

        // Job templates per company
        $jobTemplates = $this->getJobTemplates();

        foreach ($companies as $company) {
            $companyJobs = $jobTemplates[$company->company_name] ?? $jobTemplates['default'];
            $jobIndex = 0;

            // 3 jobs per month from Oct 2025 to Apr 2026 = 21 jobs, take 20
            $months = [
                Carbon::parse('2025-10-01'), Carbon::parse('2025-11-01'),
                Carbon::parse('2025-12-01'), Carbon::parse('2026-01-01'),
                Carbon::parse('2026-02-01'), Carbon::parse('2026-03-01'),
                Carbon::parse('2026-04-01'),
            ];

            foreach ($months as $month) {
                for ($i = 0; $i < 3; $i++) {
                    if ($jobIndex >= 20) break 2;

                    $template = $companyJobs[$jobIndex % count($companyJobs)];
                    $publishedAt = $month->copy()->addDays(rand(1, 25));
                    $expiresAt = $publishedAt->copy()->addDays(30);
                    $isExpired = $expiresAt->isPast();
                    $isFeatured = $jobIndex < 3 && rand(0, 1);

                    // Vary title slightly for repeats
                    $titleSuffix = $jobIndex >= count($companyJobs)
                        ? ' — ' . $publishedAt->format('M Y')
                        : '';

                    $title = $template['title'] . $titleSuffix;
                    $slug = Str::slug($title . ' ' . Str::random(4));

                    $job = JobListing::create([
                        'user_id' => $company->id,
                        'title' => $title,
                        'slug' => $slug,
                        'description' => $template['description'],
                        'requirements' => $template['requirements'],
                        'benefits' => $template['benefits'],
                        'job_type' => $template['job_type'],
                        'work_mode' => $template['work_mode'],
                        'location' => $template['location'] ?: $company->location,
                        'experience_level' => $template['experience_level'],
                        'experience_range' => $template['experience_range'],
                        'salary_min' => $template['salary_min'],
                        'salary_max' => $template['salary_max'],
                        'salary_currency' => 'INR',
                        'salary_period' => 'yearly',
                        'status' => $isExpired ? 'expired' : 'active',
                        'is_featured' => $isFeatured,
                        'views_count' => rand(50, 800),
                        'applications_count' => rand(0, 25),
                        'published_at' => $publishedAt,
                        'expires_at' => $expiresAt,
                        'created_at' => $publishedAt,
                        'updated_at' => $publishedAt,
                    ]);

                    // Attach tags
                    if (!empty($template['tags'])) {
                        $tagIds = collect($template['tags'])
                            ->map(fn($slug) => $tags->get($slug)?->id)
                            ->filter()
                            ->toArray();
                        $job->tags()->syncWithoutDetaching($tagIds);
                    }

                    $jobIndex++;
                }
            }
        }
    }

    private function getJobTemplates(): array
    {
        return [
            'TechVentures India' => [
                ['title' => 'Senior React Developer — Remote First', 'description' => "We're looking for a Senior React Developer to join our frontend team building complex, high-performance web applications.", 'requirements' => "- 3-6 years of experience with React\n- Strong TypeScript skills\n- Experience with Redux or Zustand\n- Familiarity with GraphQL", 'benefits' => "- Remote-first culture\n- Health insurance for family\n- Learning budget ₹50K/year", 'job_type' => 'full-time', 'work_mode' => 'remote', 'location' => 'Remote / Bengaluru', 'experience_level' => 'senior', 'experience_range' => '3-6 years', 'salary_min' => 1800000, 'salary_max' => 2400000, 'tags' => ['react', 'typescript', 'redux', 'graphql']],
                ['title' => 'Backend Engineer — Laravel / PHP', 'description' => "Join our backend team to build scalable APIs and services powering our platform.", 'requirements' => "- 2-4 years of experience with Laravel/PHP\n- Strong MySQL skills\n- Understanding of queue systems", 'benefits' => "- Hybrid work (3 days office)\n- Health insurance\n- Performance bonus", 'job_type' => 'full-time', 'work_mode' => 'hybrid', 'location' => 'Bengaluru', 'experience_level' => 'mid', 'experience_range' => '2-4 years', 'salary_min' => 1200000, 'salary_max' => 1800000, 'tags' => ['laravel', 'php', 'mysql', 'docker']],
                ['title' => 'DevOps Engineer — AWS + Kubernetes', 'description' => "Manage and scale our cloud infrastructure on AWS.", 'requirements' => "- 3-5 years of DevOps experience\n- AWS certified preferred\n- Strong Kubernetes knowledge", 'benefits' => "- Remote-first\n- Certification sponsorship\n- Flexible hours", 'job_type' => 'full-time', 'work_mode' => 'remote', 'location' => 'Remote', 'experience_level' => 'senior', 'experience_range' => '3-5 years', 'salary_min' => 1600000, 'salary_max' => 2200000, 'tags' => ['aws', 'docker', 'kubernetes', 'ci-cd']],
                ['title' => 'QA Automation Engineer', 'description' => "Build and maintain our test automation framework.", 'requirements' => "- 2-4 years of automation testing\n- Playwright or Cypress experience\n- CI/CD integration", 'benefits' => "- Health insurance\n- Learning budget\n- Annual retreat", 'job_type' => 'full-time', 'work_mode' => 'hybrid', 'location' => 'Bengaluru', 'experience_level' => 'mid', 'experience_range' => '2-4 years', 'salary_min' => 1000000, 'salary_max' => 1500000, 'tags' => ['testing', 'javascript', 'ci-cd']],
                ['title' => 'Junior Full Stack Developer', 'description' => "Great opportunity for freshers to join our engineering team.", 'requirements' => "- 0-2 years experience\n- Basic React and Node.js knowledge\n- Willingness to learn", 'benefits' => "- Mentorship program\n- Fast-track growth\n- Health insurance", 'job_type' => 'full-time', 'work_mode' => 'onsite', 'location' => 'Bengaluru', 'experience_level' => 'junior', 'experience_range' => '0-2 years', 'salary_min' => 500000, 'salary_max' => 800000, 'tags' => ['react', 'node-js', 'javascript']],
                ['title' => 'Technical Lead — Platform Team', 'description' => "Lead our platform engineering team of 6 engineers.", 'requirements' => "- 6+ years engineering experience\n- 2+ years leading teams\n- Strong system design", 'benefits' => "- ESOPs\n- Remote-first\n- MacBook Pro", 'job_type' => 'full-time', 'work_mode' => 'remote', 'location' => 'Remote / Bengaluru', 'experience_level' => 'lead', 'experience_range' => '6-10 years', 'salary_min' => 2800000, 'salary_max' => 4000000, 'tags' => ['system-design', 'microservices', 'aws']],
                ['title' => 'Node.js API Developer', 'description' => "Build microservices and REST APIs with Node.js.", 'requirements' => "- 2-4 years Node.js experience\n- MongoDB and Redis\n- API design patterns", 'benefits' => "- Hybrid work\n- Health insurance\n- Learning budget", 'job_type' => 'full-time', 'work_mode' => 'hybrid', 'location' => 'Bengaluru', 'experience_level' => 'mid', 'experience_range' => '2-4 years', 'salary_min' => 1200000, 'salary_max' => 1800000, 'tags' => ['node-js', 'mongodb', 'redis', 'rest-api']],
            ],
            'InnoSoft Solutions' => [
                ['title' => 'Lead Full Stack Engineer — React + Node.js', 'description' => "Architect and build our next-generation SaaS platform.", 'requirements' => "- 5-8 years of full stack experience\n- Expert in React and Node.js\n- Team leadership experience", 'benefits' => "- ESOPs\n- Premium health insurance\n- ₹1L learning budget", 'job_type' => 'full-time', 'work_mode' => 'hybrid', 'location' => 'Pune', 'experience_level' => 'lead', 'experience_range' => '5-8 years', 'salary_min' => 2200000, 'salary_max' => 3000000, 'tags' => ['react', 'node-js', 'mongodb', 'aws', 'system-design']],
                ['title' => 'Junior Python Developer — Internship to Full-time', 'description' => "Start as an intern and transition to full-time based on performance.", 'requirements' => "- 0-1 years experience (freshers welcome)\n- Basic Python knowledge\n- SQL basics", 'benefits' => "- Stipend: ₹25K/month\n- Mentorship program\n- Certificate", 'job_type' => 'internship', 'work_mode' => 'onsite', 'location' => 'Pune', 'experience_level' => 'junior', 'experience_range' => '0-1 years', 'salary_min' => 400000, 'salary_max' => 600000, 'tags' => ['python', 'sql']],
                ['title' => 'React Native Mobile Developer', 'description' => "Build cross-platform mobile apps for our HR tech product.", 'requirements' => "- 2-4 years React Native experience\n- iOS and Android deployment\n- Redux/MobX", 'benefits' => "- Hybrid work\n- Health insurance\n- Conference budget", 'job_type' => 'full-time', 'work_mode' => 'hybrid', 'location' => 'Pune', 'experience_level' => 'mid', 'experience_range' => '2-4 years', 'salary_min' => 1400000, 'salary_max' => 2000000, 'tags' => ['react', 'javascript', 'redux']],
                ['title' => 'UI/UX Designer + Frontend Developer', 'description' => "Design and implement beautiful, accessible user interfaces.", 'requirements' => "- 2-3 years design + frontend experience\n- Figma proficiency\n- React/Tailwind CSS", 'benefits' => "- Creative freedom\n- Flexible hours\n- Design tool licenses", 'job_type' => 'full-time', 'work_mode' => 'remote', 'location' => 'Remote', 'experience_level' => 'mid', 'experience_range' => '2-3 years', 'salary_min' => 1000000, 'salary_max' => 1600000, 'tags' => ['react', 'css', 'html', 'tailwind-css']],
                ['title' => 'PostgreSQL Database Administrator', 'description' => "Manage and optimize our production databases.", 'requirements' => "- 3-5 years DBA experience\n- PostgreSQL expert\n- Performance tuning", 'benefits' => "- Remote-first\n- Health insurance\n- On-call allowance", 'job_type' => 'full-time', 'work_mode' => 'remote', 'location' => 'Remote', 'experience_level' => 'senior', 'experience_range' => '3-5 years', 'salary_min' => 1500000, 'salary_max' => 2200000, 'tags' => ['postgresql', 'sql', 'linux']],
                ['title' => 'Backend Developer — Django / Python', 'description' => "Build APIs and backend services with Django.", 'requirements' => "- 2-4 years Python/Django\n- REST API design\n- Celery/Redis", 'benefits' => "- Hybrid work\n- Performance bonus\n- Health coverage", 'job_type' => 'full-time', 'work_mode' => 'hybrid', 'location' => 'Pune', 'experience_level' => 'mid', 'experience_range' => '2-4 years', 'salary_min' => 1200000, 'salary_max' => 1800000, 'tags' => ['python', 'django', 'redis']],
            ],
            'CloudNine Technologies' => [
                ['title' => 'Cloud Solutions Architect — AWS', 'description' => "Design and implement cloud migration strategies for enterprise clients.", 'requirements' => "- 5+ years cloud architecture\n- AWS Solutions Architect certified\n- Multi-account strategy", 'benefits' => "- Top-of-market salary\n- Certification sponsorship\n- Remote-first", 'job_type' => 'full-time', 'work_mode' => 'remote', 'location' => 'Remote / Hyderabad', 'experience_level' => 'lead', 'experience_range' => '5-10 years', 'salary_min' => 3000000, 'salary_max' => 4500000, 'tags' => ['aws', 'system-design', 'kubernetes', 'docker']],
                ['title' => 'Site Reliability Engineer', 'description' => "Ensure 99.99% uptime for our managed cloud infrastructure.", 'requirements' => "- 3-5 years SRE/DevOps\n- Prometheus/Grafana\n- Incident management", 'benefits' => "- On-call bonus\n- Remote work\n- Health insurance", 'job_type' => 'full-time', 'work_mode' => 'remote', 'location' => 'Remote', 'experience_level' => 'senior', 'experience_range' => '3-5 years', 'salary_min' => 2000000, 'salary_max' => 3000000, 'tags' => ['linux', 'docker', 'kubernetes', 'aws']],
                ['title' => 'Terraform / IaC Engineer', 'description' => "Build and maintain infrastructure-as-code for client environments.", 'requirements' => "- 2-4 years Terraform experience\n- Multi-cloud (AWS/Azure)\n- CI/CD pipelines", 'benefits' => "- Hybrid work\n- Learning budget\n- Performance bonus", 'job_type' => 'full-time', 'work_mode' => 'hybrid', 'location' => 'Hyderabad', 'experience_level' => 'mid', 'experience_range' => '2-4 years', 'salary_min' => 1400000, 'salary_max' => 2000000, 'tags' => ['aws', 'docker', 'ci-cd', 'linux']],
                ['title' => 'Go Backend Developer', 'description' => "Build high-performance CLI tools and APIs in Go.", 'requirements' => "- 2+ years Go experience\n- gRPC/Protobuf\n- Docker native", 'benefits' => "- Remote-first\n- Flexible hours\n- Open source time", 'job_type' => 'full-time', 'work_mode' => 'remote', 'location' => 'Remote', 'experience_level' => 'mid', 'experience_range' => '2-4 years', 'salary_min' => 1600000, 'salary_max' => 2400000, 'tags' => ['go', 'docker', 'linux', 'rest-api']],
                ['title' => 'Junior Cloud Support Engineer', 'description' => "L1/L2 support for managed cloud clients.", 'requirements' => "- 0-2 years experience\n- Basic AWS/Linux\n- Troubleshooting skills", 'benefits' => "- Training provided\n- Certification path\n- Shift allowance", 'job_type' => 'full-time', 'work_mode' => 'onsite', 'location' => 'Hyderabad', 'experience_level' => 'junior', 'experience_range' => '0-2 years', 'salary_min' => 400000, 'salary_max' => 700000, 'tags' => ['aws', 'linux']],
                ['title' => 'Platform Engineer — Kubernetes', 'description' => "Build internal developer platforms on Kubernetes.", 'requirements' => "- 3-5 years platform engineering\n- Kubernetes operator development\n- Helm charts", 'benefits' => "- Remote-first\n- Conference sponsorship\n- Health coverage", 'job_type' => 'full-time', 'work_mode' => 'remote', 'location' => 'Remote', 'experience_level' => 'senior', 'experience_range' => '3-5 years', 'salary_min' => 2200000, 'salary_max' => 3200000, 'tags' => ['kubernetes', 'docker', 'linux', 'go']],
            ],
            'PixelCraft Studios' => [
                ['title' => 'Senior React + Next.js Developer', 'description' => "Build stunning web experiences for our agency clients.", 'requirements' => "- 3-5 years React/Next.js\n- Tailwind CSS\n- Animation libraries (Framer Motion)", 'benefits' => "- Creative projects\n- Flexible hours\n- Apple hardware", 'job_type' => 'full-time', 'work_mode' => 'remote', 'location' => 'Remote / Mumbai', 'experience_level' => 'senior', 'experience_range' => '3-5 years', 'salary_min' => 1600000, 'salary_max' => 2400000, 'tags' => ['react', 'next-js', 'tailwind-css', 'javascript']],
                ['title' => 'Motion Designer + Frontend Developer', 'description' => "Create interactive animations and micro-interactions.", 'requirements' => "- 2-3 years motion design\n- GSAP/Lottie/Framer Motion\n- React basics", 'benefits' => "- Creative freedom\n- Design tool licenses\n- Remote work", 'job_type' => 'full-time', 'work_mode' => 'remote', 'location' => 'Remote', 'experience_level' => 'mid', 'experience_range' => '2-3 years', 'salary_min' => 1000000, 'salary_max' => 1600000, 'tags' => ['javascript', 'css', 'react']],
                ['title' => 'Freelance WordPress Developer', 'description' => "Build custom WordPress themes and plugins for client projects.", 'requirements' => "- 2+ years WordPress\n- PHP/ACF/Gutenberg\n- WooCommerce experience", 'benefits' => "- Flexible hours\n- Project-based pay\n- Portfolio building", 'job_type' => 'freelance', 'work_mode' => 'remote', 'location' => 'Remote', 'experience_level' => 'mid', 'experience_range' => '2-4 years', 'salary_min' => 800000, 'salary_max' => 1400000, 'tags' => ['php', 'javascript', 'css', 'html']],
                ['title' => 'Vue.js Frontend Developer', 'description' => "Build admin panels and dashboards with Vue.js.", 'requirements' => "- 2-3 years Vue.js\n- Vuex/Pinia\n- Tailwind CSS", 'benefits' => "- Remote-first\n- Design tool access\n- Annual retreat", 'job_type' => 'full-time', 'work_mode' => 'remote', 'location' => 'Remote', 'experience_level' => 'mid', 'experience_range' => '2-3 years', 'salary_min' => 1000000, 'salary_max' => 1600000, 'tags' => ['vue-js', 'javascript', 'tailwind-css']],
                ['title' => 'Design Intern — UI/UX', 'description' => "Learn UI/UX design while working on real client projects.", 'requirements' => "- Figma proficiency\n- Basic HTML/CSS\n- Strong design sense", 'benefits' => "- Stipend ₹15K/month\n- Portfolio building\n- Mentorship", 'job_type' => 'internship', 'work_mode' => 'hybrid', 'location' => 'Mumbai', 'experience_level' => 'junior', 'experience_range' => '0-1 years', 'salary_min' => 180000, 'salary_max' => 300000, 'tags' => ['html', 'css']],
                ['title' => 'Full Stack Developer — MERN', 'description' => "Build full stack web apps for startups and scale-ups.", 'requirements' => "- 2-4 years MERN stack\n- MongoDB Atlas\n- Vercel/Netlify deployment", 'benefits' => "- Client variety\n- Remote work\n- Learning budget", 'job_type' => 'full-time', 'work_mode' => 'remote', 'location' => 'Remote', 'experience_level' => 'mid', 'experience_range' => '2-4 years', 'salary_min' => 1200000, 'salary_max' => 1800000, 'tags' => ['react', 'node-js', 'mongodb', 'javascript']],
            ],
            'DataLogic AI' => [
                ['title' => 'Machine Learning Engineer — NLP', 'description' => "Build NLP models for our intelligent automation platform.", 'requirements' => "- 3-5 years ML experience\n- PyTorch/TensorFlow\n- NLP (BERT, GPT fine-tuning)", 'benefits' => "- GPU compute budget\n- Research time\n- Conference sponsorship", 'job_type' => 'full-time', 'work_mode' => 'hybrid', 'location' => 'Delhi', 'experience_level' => 'senior', 'experience_range' => '3-5 years', 'salary_min' => 2400000, 'salary_max' => 3600000, 'tags' => ['python', 'tensorflow']],
                ['title' => 'Data Engineer — Spark / Airflow', 'description' => "Build and maintain our data pipelines processing TB-scale data.", 'requirements' => "- 2-4 years data engineering\n- Apache Spark\n- Airflow/Dagster", 'benefits' => "- Hybrid work\n- Health insurance\n- Performance bonus", 'job_type' => 'full-time', 'work_mode' => 'hybrid', 'location' => 'Delhi', 'experience_level' => 'mid', 'experience_range' => '2-4 years', 'salary_min' => 1600000, 'salary_max' => 2400000, 'tags' => ['python', 'sql', 'aws']],
                ['title' => 'Computer Vision Engineer', 'description' => "Develop CV models for healthcare and logistics use cases.", 'requirements' => "- 3+ years CV experience\n- OpenCV/YOLO/Detectron2\n- Edge deployment", 'benefits' => "- Research publications\n- GPU access\n- Health insurance", 'job_type' => 'full-time', 'work_mode' => 'hybrid', 'location' => 'Delhi', 'experience_level' => 'senior', 'experience_range' => '3-5 years', 'salary_min' => 2200000, 'salary_max' => 3200000, 'tags' => ['python', 'tensorflow', 'docker']],
                ['title' => 'Backend Developer — FastAPI / Python', 'description' => "Build high-performance APIs serving ML model predictions.", 'requirements' => "- 2-3 years Python backend\n- FastAPI or Flask\n- Docker/Kubernetes", 'benefits' => "- Hybrid work\n- Learning budget\n- Health coverage", 'job_type' => 'full-time', 'work_mode' => 'hybrid', 'location' => 'Delhi', 'experience_level' => 'mid', 'experience_range' => '2-3 years', 'salary_min' => 1200000, 'salary_max' => 1800000, 'tags' => ['python', 'docker', 'rest-api', 'redis']],
                ['title' => 'Junior ML Intern', 'description' => "Learn ML engineering in a production environment.", 'requirements' => "- Basic Python and ML knowledge\n- Statistics background\n- Jupyter/Pandas", 'benefits' => "- Stipend ₹30K/month\n- Mentorship by PhDs\n- Research exposure", 'job_type' => 'internship', 'work_mode' => 'onsite', 'location' => 'Delhi', 'experience_level' => 'junior', 'experience_range' => '0-1 years', 'salary_min' => 360000, 'salary_max' => 500000, 'tags' => ['python', 'sql']],
                ['title' => 'React Frontend Developer — AI Dashboard', 'description' => "Build interactive dashboards for our AI analytics platform.", 'requirements' => "- 2-4 years React\n- Data visualization (Recharts/D3)\n- TypeScript", 'benefits' => "- Remote-first\n- Health insurance\n- Stock options", 'job_type' => 'full-time', 'work_mode' => 'remote', 'location' => 'Remote', 'experience_level' => 'mid', 'experience_range' => '2-4 years', 'salary_min' => 1400000, 'salary_max' => 2000000, 'tags' => ['react', 'typescript', 'javascript']],
            ],
            'default' => [
                ['title' => 'Software Engineer', 'description' => "Build and maintain software solutions.", 'requirements' => "- 2+ years experience\n- Strong coding skills", 'benefits' => "- Health insurance\n- Flexible hours", 'job_type' => 'full-time', 'work_mode' => 'hybrid', 'location' => 'India', 'experience_level' => 'mid', 'experience_range' => '2-4 years', 'salary_min' => 1000000, 'salary_max' => 1800000, 'tags' => ['javascript', 'react']],
            ],
        ];
    }
}
