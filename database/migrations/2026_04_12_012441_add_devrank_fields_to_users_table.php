<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->after('email');
            $table->string('avatar')->nullable()->after('phone');
            $table->text('bio')->nullable()->after('avatar');
            $table->string('location')->nullable()->after('bio');
            $table->string('website')->nullable()->after('location');
            $table->string('github_url')->nullable()->after('website');
            $table->string('linkedin_url')->nullable()->after('github_url');

            // Candidate fields
            $table->string('headline')->nullable()->after('linkedin_url');
            $table->string('resume_path')->nullable()->after('headline');
            $table->string('experience_level')->nullable()->after('resume_path');
            $table->unsignedSmallInteger('years_of_experience')->nullable()->after('experience_level');
            $table->boolean('open_to_work')->default(false)->after('years_of_experience');
            $table->string('preferred_job_type')->nullable()->after('open_to_work');
            $table->string('preferred_location')->nullable()->after('preferred_job_type');
            $table->string('salary_expectation')->nullable()->after('preferred_location');

            // Company fields
            $table->string('company_name')->nullable()->after('salary_expectation');
            $table->string('company_website')->nullable()->after('company_name');
            $table->string('company_size')->nullable()->after('company_website');
            $table->string('industry')->nullable()->after('company_size');
            $table->text('company_description')->nullable()->after('industry');
            $table->string('company_logo')->nullable()->after('company_description');

            // Ranking & trust
            $table->unsignedInteger('total_rank_score')->default(0)->after('company_logo');
            $table->decimal('human_score', 5, 2)->default(0)->after('total_rank_score');
            $table->unsignedSmallInteger('trust_score')->default(0)->after('human_score');

            // Monthly limits
            $table->unsignedTinyInteger('monthly_job_applications')->default(0)->after('trust_score');
            $table->unsignedTinyInteger('monthly_job_posts')->default(0)->after('monthly_job_applications');
            $table->unsignedTinyInteger('monthly_outreach_sent')->default(0)->after('monthly_job_posts');
            $table->date('limits_reset_at')->nullable()->after('monthly_outreach_sent');

            $table->boolean('is_active')->default(true)->after('limits_reset_at');
            $table->softDeletes();

            // Indexes
            $table->index('total_rank_score');
            $table->index('experience_level');
            $table->index('open_to_work');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropIndex(['total_rank_score']);
            $table->dropIndex(['experience_level']);
            $table->dropIndex(['open_to_work']);
            $table->dropIndex(['is_active']);
            $table->dropColumn([
                'phone', 'avatar', 'bio', 'location', 'website', 'github_url', 'linkedin_url',
                'headline', 'resume_path', 'experience_level', 'years_of_experience',
                'open_to_work', 'preferred_job_type', 'preferred_location', 'salary_expectation',
                'company_name', 'company_website', 'company_size', 'industry',
                'company_description', 'company_logo',
                'total_rank_score', 'human_score', 'trust_score',
                'monthly_job_applications', 'monthly_job_posts', 'monthly_outreach_sent',
                'limits_reset_at', 'is_active',
            ]);
        });
    }
};