<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            AdminUserSeeder::class,
            CategorySeeder::class,
            TagSeeder::class,
            DemoUserSeeder::class,
            DemoJobSeeder::class,
            DemoForumSeeder::class,
            DemoInteractionSeeder::class,
        ]);
    }
}
