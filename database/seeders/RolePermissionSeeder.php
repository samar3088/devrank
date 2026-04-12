<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // User management
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'users.ban',

            // Sub Admin management
            'subadmin.create',
            'subadmin.edit',
            'subadmin.remove',

            // Forum
            'categories.view',
            'categories.create',
            'categories.edit',
            'categories.delete',
            'topics.create',
            'topics.edit',
            'topics.edit_own',
            'topics.delete',
            'topics.delete_own',
            'topics.moderate',
            'replies.create',
            'replies.edit',
            'replies.edit_own',
            'replies.delete',
            'replies.delete_own',
            'replies.moderate',
            'tags.suggest',
            'tags.approve',
            'tags.delete',

            // Jobs
            'jobs.create',
            'jobs.edit',
            'jobs.edit_own',
            'jobs.delete',
            'jobs.delete_own',
            'jobs.manage',
            'jobs.apply',
            'jobs.feature',

            // Interest / Profile
            'interest.send',
            'interest.respond',
            'profiles.view_full',
            'profiles.view_limited',

            // Admin
            'admin.dashboard',
            'admin.analytics',
            'admin.settings',
            'admin.logs',
            'admin.moderate',

            // System
            'system.settings',
            'system.outreach_limit',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Super Admin — everything
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Sub Admin — everything except delete and system settings
        $deletePermissions = Permission::where('name', 'like', '%.delete%')
            ->orWhere('name', 'like', '%.remove%')
            ->orWhere('name', 'system.settings')
            ->orWhere('name', 'subadmin.create')
            ->pluck('name')
            ->toArray();

        $subAdmin = Role::firstOrCreate(['name' => 'sub_admin']);
        $subAdmin->givePermissionTo(
            Permission::whereNotIn('name', $deletePermissions)->pluck('name')
        );

        // Company
        $company = Role::firstOrCreate(['name' => 'company']);
        $company->givePermissionTo([
            'jobs.create',
            'jobs.edit_own',
            'jobs.delete_own',
            'interest.send',
            'profiles.view_limited',
            'profiles.view_full',
            'topics.create',
            'topics.edit_own',
            'replies.create',
            'replies.edit_own',
            'tags.suggest',
        ]);

        // Candidate
        $candidate = Role::firstOrCreate(['name' => 'candidate']);
        $candidate->givePermissionTo([
            'topics.create',
            'topics.edit_own',
            'topics.delete_own',
            'replies.create',
            'replies.edit_own',
            'replies.delete_own',
            'tags.suggest',
            'jobs.apply',
            'interest.respond',
            'profiles.view_limited',
        ]);
    }
}