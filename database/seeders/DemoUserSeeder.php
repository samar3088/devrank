<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        // ── 30 Candidates ───────────────────────────────
        $candidates = [
            ['name' => 'Arjun Kumar',       'email' => 'arjun@devrank.com',       'headline' => 'Senior React Developer',          'location' => 'Bengaluru',  'experience_level' => 'senior', 'years_of_experience' => 6, 'open_to_work' => true,  'total_rank_score' => 4820, 'human_score' => 96.00, 'bio' => 'Passionate React developer obsessed with performance and DX. I write extensively on the DevRank forum to give back to the community and stay sharp. Currently open to senior/lead roles in product companies.', 'github_url' => 'https://github.com/arjunkumar', 'linkedin_url' => 'https://linkedin.com/in/arjunkumar'],
            ['name' => 'Priya Sharma',      'email' => 'priya@devrank.com',       'headline' => 'Full Stack Node.js Developer',    'location' => 'Mumbai',     'experience_level' => 'senior', 'years_of_experience' => 5, 'open_to_work' => true,  'total_rank_score' => 4610, 'human_score' => 94.00, 'bio' => 'Building scalable Node.js apps. Active open source contributor.', 'github_url' => 'https://github.com/priyasharma', 'linkedin_url' => null],
            ['name' => 'Rohan Verma',       'email' => 'rohan@devrank.com',       'headline' => 'Laravel Backend Engineer',        'location' => 'Hyderabad',  'experience_level' => 'mid',    'years_of_experience' => 4, 'open_to_work' => true,  'total_rank_score' => 4390, 'human_score' => 91.00, 'bio' => 'Backend specialist with deep Laravel knowledge.', 'github_url' => null, 'linkedin_url' => 'https://linkedin.com/in/rohanverma'],
            ['name' => 'Meera Nair',        'email' => 'meera@devrank.com',       'headline' => 'System Design Specialist',        'location' => 'Pune',       'experience_level' => 'senior', 'years_of_experience' => 7, 'open_to_work' => false, 'total_rank_score' => 4205, 'human_score' => 89.00, 'bio' => 'Architecting distributed systems at scale.', 'github_url' => 'https://github.com/meeranair', 'linkedin_url' => null],
            ['name' => 'Siddharth Khan',    'email' => 'siddharth@devrank.com',   'headline' => 'DevOps & AWS Engineer',           'location' => 'Delhi',      'experience_level' => 'mid',    'years_of_experience' => 4, 'open_to_work' => true,  'total_rank_score' => 4120, 'human_score' => 93.00, 'bio' => 'Cloud infrastructure and CI/CD pipelines.', 'github_url' => null, 'linkedin_url' => null],
            ['name' => 'Ananya Reddy',      'email' => 'ananya@devrank.com',      'headline' => 'Frontend Engineer (Vue.js)',      'location' => 'Chennai',    'experience_level' => 'mid',    'years_of_experience' => 3, 'open_to_work' => true,  'total_rank_score' => 3950, 'human_score' => 90.00, 'bio' => 'Vue.js enthusiast building beautiful UIs.', 'github_url' => 'https://github.com/ananyareddy', 'linkedin_url' => null],
            ['name' => 'Vikram Singh',      'email' => 'vikram@devrank.com',      'headline' => 'Python / Django Developer',       'location' => 'Noida',      'experience_level' => 'senior', 'years_of_experience' => 6, 'open_to_work' => true,  'total_rank_score' => 3870, 'human_score' => 88.00, 'bio' => 'Python developer with ML experience.', 'github_url' => null, 'linkedin_url' => 'https://linkedin.com/in/vikramsingh'],
            ['name' => 'Kavitha Menon',     'email' => 'kavitha@devrank.com',     'headline' => 'React Native Mobile Developer',   'location' => 'Kochi',      'experience_level' => 'mid',    'years_of_experience' => 4, 'open_to_work' => true,  'total_rank_score' => 3740, 'human_score' => 92.00, 'bio' => 'Cross-platform mobile apps with React Native.', 'github_url' => 'https://github.com/kavithamenon', 'linkedin_url' => null],
            ['name' => 'Rahul Joshi',       'email' => 'rahul@devrank.com',       'headline' => 'Java Spring Boot Developer',      'location' => 'Pune',       'experience_level' => 'senior', 'years_of_experience' => 8, 'open_to_work' => false, 'total_rank_score' => 3680, 'human_score' => 87.00, 'bio' => 'Enterprise Java developer, microservices expert.', 'github_url' => null, 'linkedin_url' => null],
            ['name' => 'Deepika Patel',     'email' => 'deepika@devrank.com',     'headline' => 'Full Stack Developer',            'location' => 'Ahmedabad',  'experience_level' => 'mid',    'years_of_experience' => 3, 'open_to_work' => true,  'total_rank_score' => 3520, 'human_score' => 95.00, 'bio' => 'MERN stack developer building SaaS products.', 'github_url' => 'https://github.com/deepikapatel', 'linkedin_url' => null],
            ['name' => 'Aditya Mehta',      'email' => 'aditya@devrank.com',      'headline' => 'Go Backend Engineer',             'location' => 'Bengaluru',  'experience_level' => 'senior', 'years_of_experience' => 5, 'open_to_work' => true,  'total_rank_score' => 3410, 'human_score' => 86.00, 'bio' => 'Building high-performance APIs in Go.', 'github_url' => 'https://github.com/adityamehta', 'linkedin_url' => null],
            ['name' => 'Sneha Iyer',        'email' => 'sneha@devrank.com',       'headline' => 'UI/UX + React Developer',         'location' => 'Mumbai',     'experience_level' => 'mid',    'years_of_experience' => 3, 'open_to_work' => true,  'total_rank_score' => 3280, 'human_score' => 91.00, 'bio' => 'Design-minded frontend developer.', 'github_url' => null, 'linkedin_url' => 'https://linkedin.com/in/snehaiyer'],
            ['name' => 'Karthik Rajan',     'email' => 'karthik@devrank.com',     'headline' => 'Angular / .NET Developer',        'location' => 'Chennai',    'experience_level' => 'senior', 'years_of_experience' => 7, 'open_to_work' => false, 'total_rank_score' => 3150, 'human_score' => 84.00, 'bio' => 'Enterprise Angular applications.', 'github_url' => null, 'linkedin_url' => null],
            ['name' => 'Nisha Gupta',       'email' => 'nisha@devrank.com',       'headline' => 'Data Engineer (Python/Spark)',     'location' => 'Hyderabad',  'experience_level' => 'mid',    'years_of_experience' => 4, 'open_to_work' => true,  'total_rank_score' => 3020, 'human_score' => 88.00, 'bio' => 'Big data pipelines and ETL.', 'github_url' => 'https://github.com/nishagupta', 'linkedin_url' => null],
            ['name' => 'Amit Choudhary',    'email' => 'amit@devrank.com',        'headline' => 'Rust Systems Programmer',         'location' => 'Delhi',      'experience_level' => 'senior', 'years_of_experience' => 6, 'open_to_work' => true,  'total_rank_score' => 2890, 'human_score' => 97.00, 'bio' => 'Low-level systems programming in Rust.', 'github_url' => 'https://github.com/amitchoudhary', 'linkedin_url' => null],
            ['name' => 'Pooja Desai',       'email' => 'pooja@devrank.com',       'headline' => 'QA Automation Engineer',           'location' => 'Bengaluru',  'experience_level' => 'mid',    'years_of_experience' => 3, 'open_to_work' => true,  'total_rank_score' => 2750, 'human_score' => 90.00, 'bio' => 'Test automation with Playwright and Cypress.', 'github_url' => null, 'linkedin_url' => null],
            ['name' => 'Suresh Pillai',     'email' => 'suresh@devrank.com',      'headline' => 'PHP / WordPress Developer',       'location' => 'Trivandrum', 'experience_level' => 'mid',    'years_of_experience' => 5, 'open_to_work' => true,  'total_rank_score' => 2630, 'human_score' => 82.00, 'bio' => 'WordPress and custom PHP solutions.', 'github_url' => null, 'linkedin_url' => null],
            ['name' => 'Tanvi Agarwal',     'email' => 'tanvi@devrank.com',       'headline' => 'iOS Swift Developer',             'location' => 'Gurgaon',    'experience_level' => 'mid',    'years_of_experience' => 3, 'open_to_work' => false, 'total_rank_score' => 2500, 'human_score' => 93.00, 'bio' => 'Native iOS apps with SwiftUI.', 'github_url' => 'https://github.com/tanviagarwal', 'linkedin_url' => null],
            ['name' => 'Manish Tiwari',     'email' => 'manish@devrank.com',      'headline' => 'Kubernetes & Cloud Architect',    'location' => 'Pune',       'experience_level' => 'lead',   'years_of_experience' => 9, 'open_to_work' => true,  'total_rank_score' => 2380, 'human_score' => 85.00, 'bio' => 'Cloud native architecture and Kubernetes at scale.', 'github_url' => null, 'linkedin_url' => 'https://linkedin.com/in/manishtiwari'],
            ['name' => 'Ritu Saxena',       'email' => 'ritu@devrank.com',        'headline' => 'ML Engineer (TensorFlow)',         'location' => 'Bengaluru',  'experience_level' => 'senior', 'years_of_experience' => 5, 'open_to_work' => true,  'total_rank_score' => 2240, 'human_score' => 87.00, 'bio' => 'Machine learning models in production.', 'github_url' => 'https://github.com/ritusaxena', 'linkedin_url' => null],
            ['name' => 'Harsh Vardhan',     'email' => 'harsh@devrank.com',       'headline' => 'Blockchain Developer',            'location' => 'Mumbai',     'experience_level' => 'mid',    'years_of_experience' => 3, 'open_to_work' => true,  'total_rank_score' => 2100, 'human_score' => 89.00, 'bio' => 'Smart contracts and DeFi protocols.', 'github_url' => 'https://github.com/harshvardhan', 'linkedin_url' => null],
            ['name' => 'Lakshmi Narayan',   'email' => 'lakshmi@devrank.com',     'headline' => 'Database Administrator',          'location' => 'Hyderabad',  'experience_level' => 'senior', 'years_of_experience' => 8, 'open_to_work' => false, 'total_rank_score' => 1980, 'human_score' => 83.00, 'bio' => 'PostgreSQL and MySQL performance tuning.', 'github_url' => null, 'linkedin_url' => null],
            ['name' => 'Gaurav Mishra',     'email' => 'gaurav@devrank.com',      'headline' => 'Next.js Developer',               'location' => 'Jaipur',     'experience_level' => 'mid',    'years_of_experience' => 3, 'open_to_work' => true,  'total_rank_score' => 1850, 'human_score' => 92.00, 'bio' => 'Full stack Next.js and Vercel deployments.', 'github_url' => 'https://github.com/gauravmishra', 'linkedin_url' => null],
            ['name' => 'Divya Kapoor',      'email' => 'divya@devrank.com',       'headline' => 'React + TypeScript Specialist',   'location' => 'Delhi',      'experience_level' => 'mid',    'years_of_experience' => 4, 'open_to_work' => true,  'total_rank_score' => 1720, 'human_score' => 94.00, 'bio' => 'Type-safe React applications.', 'github_url' => null, 'linkedin_url' => 'https://linkedin.com/in/divyakapoor'],
            ['name' => 'Ajay Thakur',       'email' => 'ajay@devrank.com',        'headline' => 'Microservices Architect',         'location' => 'Bengaluru',  'experience_level' => 'lead',   'years_of_experience' => 10, 'open_to_work' => false, 'total_rank_score' => 1600, 'human_score' => 81.00, 'bio' => 'Designing distributed systems at enterprise scale.', 'github_url' => null, 'linkedin_url' => null],
            ['name' => 'Swati Kulkarni',    'email' => 'swati@devrank.com',       'headline' => 'Ruby on Rails Developer',         'location' => 'Pune',       'experience_level' => 'mid',    'years_of_experience' => 4, 'open_to_work' => true,  'total_rank_score' => 1480, 'human_score' => 90.00, 'bio' => 'Building Rails APIs and admin panels.', 'github_url' => 'https://github.com/swatikulkarni', 'linkedin_url' => null],
            ['name' => 'Rajesh Sundaram',   'email' => 'rajesh@devrank.com',      'headline' => 'Embedded Systems / IoT Developer','location' => 'Coimbatore', 'experience_level' => 'senior', 'years_of_experience' => 7, 'open_to_work' => true,  'total_rank_score' => 1350, 'human_score' => 86.00, 'bio' => 'IoT firmware and embedded C/C++.', 'github_url' => null, 'linkedin_url' => null],
            ['name' => 'Neelam Soni',       'email' => 'neelam@devrank.com',      'headline' => 'Salesforce Developer',            'location' => 'Noida',      'experience_level' => 'mid',    'years_of_experience' => 4, 'open_to_work' => true,  'total_rank_score' => 1220, 'human_score' => 85.00, 'bio' => 'Salesforce Apex and Lightning components.', 'github_url' => null, 'linkedin_url' => null],
            ['name' => 'Tushar Bansal',     'email' => 'tushar@devrank.com',      'headline' => 'Junior Frontend Developer',       'location' => 'Lucknow',    'experience_level' => 'junior', 'years_of_experience' => 1, 'open_to_work' => true,  'total_rank_score' => 1100, 'human_score' => 95.00, 'bio' => 'Learning React and building projects.', 'github_url' => 'https://github.com/tusharbansal', 'linkedin_url' => null],
            ['name' => 'Ishita Bhatt',      'email' => 'ishita@devrank.com',      'headline' => 'DevOps Intern → Full-time',       'location' => 'Indore',     'experience_level' => 'junior', 'years_of_experience' => 1, 'open_to_work' => true,  'total_rank_score' => 980,  'human_score' => 96.00, 'bio' => 'Fresh grad learning Docker and AWS.', 'github_url' => null, 'linkedin_url' => null],
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
                'total_rank_score' => $data['total_rank_score'],
                'human_score' => $data['human_score'],
                'bio' => $data['bio'],
                'github_url' => $data['github_url'] ?? null,
                'linkedin_url' => $data['linkedin_url'] ?? null,
                'is_active' => true,
            ]);
            $user->assignRole('candidate');
        }

        // ── 5 Companies ─────────────────────────────────
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
            [
                'name' => 'Sameer Kapoor',
                'email' => 'sameer@cloudnine.com',
                'company_name' => 'CloudNine Technologies',
                'company_website' => 'https://cloudnine.tech',
                'company_size' => '201-500',
                'industry' => 'Cloud Infrastructure',
                'company_description' => 'CloudNine Technologies provides enterprise cloud migration, managed DevOps, and infrastructure-as-code solutions for Fortune 500 companies across APAC.',
                'trust_score' => 88,
                'location' => 'Hyderabad',
            ],
            [
                'name' => 'Anita Deshmukh',
                'email' => 'anita@pixelcraft.com',
                'company_name' => 'PixelCraft Studios',
                'company_website' => 'https://pixelcraft.co',
                'company_size' => '11-50',
                'industry' => 'Design & Development Agency',
                'company_description' => 'PixelCraft Studios is a boutique design and development agency creating stunning digital experiences for startups and brands. We focus on React, Next.js, and mobile-first design.',
                'trust_score' => 76,
                'location' => 'Mumbai',
            ],
            [
                'name' => 'Rajiv Malhotra',
                'email' => 'rajiv@datalogic.com',
                'company_name' => 'DataLogic AI',
                'company_website' => 'https://datalogic.ai',
                'company_size' => '51-200',
                'industry' => 'AI / Machine Learning',
                'company_description' => 'DataLogic AI builds intelligent automation platforms using machine learning, NLP, and computer vision. Our products serve healthcare, fintech, and logistics industries.',
                'trust_score' => 82,
                'location' => 'Delhi',
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
