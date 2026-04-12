<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin — FIRST user created, auto gets super_admin
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@devrank.com',
            'password' => Hash::make('Admin@123'),
            'email_verified_at' => now(),
            'is_active' => true,
        ]);
        $superAdmin->assignRole('super_admin');

        // Sub Admin
        $subAdmin = User::create([
            'name' => 'Sub Admin',
            'email' => 'subadmin@devrank.com',
            'password' => Hash::make('Admin@123'),
            'email_verified_at' => now(),
            'is_active' => true,
        ]);
        $subAdmin->assignRole('sub_admin');
    }
}