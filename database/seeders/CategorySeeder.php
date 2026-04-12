<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'General Discussion', 'icon' => '💬', 'color' => '#7c6dfa', 'description' => 'Pair programming, career advice, and general developer chat.'],
            ['name' => 'Frontend Development', 'icon' => '🎨', 'color' => '#5bc4f8', 'description' => 'React, Vue, Angular, CSS, HTML, and everything frontend.'],
            ['name' => 'Backend Development', 'icon' => '⚙️', 'color' => '#34eba0', 'description' => 'Laravel, Node.js, Python, APIs, databases, and server-side topics.'],
            ['name' => 'DevOps & Cloud', 'icon' => '☁️', 'color' => '#f0c96e', 'description' => 'AWS, Docker, Kubernetes, CI/CD, and infrastructure.'],
            ['name' => 'System Design', 'icon' => '🏗️', 'color' => '#b09eff', 'description' => 'Architecture patterns, scalability, and system design discussions.'],
            ['name' => 'Interview Preparation', 'icon' => '🎯', 'color' => '#ff5c4d', 'description' => 'DSA, coding challenges, mock interviews, and prep strategies.'],
            ['name' => 'Career & Growth', 'icon' => '📈', 'color' => '#34eba0', 'description' => 'Salary negotiations, career switches, freelancing, and growth tips.'],
            ['name' => 'Company Reviews', 'icon' => '🏢', 'color' => '#f0c96e', 'description' => 'Share and read honest work environment and interview reviews.'],
        ];

        foreach ($categories as $index => $category) {
            Category::create([
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'description' => $category['description'],
                'icon' => $category['icon'],
                'color' => $category['color'],
                'sort_order' => $index + 1,
                'is_active' => true,
            ]);
        }
    }
}