<?php

namespace Database\Seeders;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = User::first()->id;

        $tags = [
            'React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript',
            'Node.js', 'Laravel', 'PHP', 'Python', 'Django',
            'Java', 'Spring Boot', 'Go', 'Rust', 'Ruby on Rails',
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQL',
            'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux',
            'System Design', 'Microservices', 'REST API', 'GraphQL', 'gRPC',
            'Git', 'Agile', 'Testing', 'TDD', 'DevOps',
            'HTML', 'CSS', 'Tailwind CSS', 'SASS', 'Next.js',
            'Redux', 'Webpack', 'Vite', 'Firebase', 'Supabase',
        ];

        foreach ($tags as $tag) {
            Tag::create([
                'name' => $tag,
                'slug' => Str::slug($tag),
                'status' => 'approved',
                'suggested_by' => $adminId,
                'approved_by' => $adminId,
                'approved_at' => now(),
            ]);
        }

        // A few pending tags (as if suggested by users)
        $pendingTags = ['Svelte', 'Deno', 'Bun', 'HTMX', 'Elixir'];
        foreach ($pendingTags as $tag) {
            Tag::create([
                'name' => $tag,
                'slug' => Str::slug($tag),
                'status' => 'pending',
                'suggested_by' => $adminId,
            ]);
        }
    }
}