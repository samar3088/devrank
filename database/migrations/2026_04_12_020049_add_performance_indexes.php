<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Users: composite index for candidate search/leaderboard
        Schema::table('users', function (Blueprint $table) {
            $table->index(['open_to_work', 'is_active', 'total_rank_score'], 'idx_candidate_search');
            $table->index('email_verified_at');
        });

        // Replies: quick lookup for accepted answers
        Schema::table('replies', function (Blueprint $table) {
            $table->index(['topic_id', 'is_accepted'], 'idx_accepted_answer');
        });

        // Jobs: salary range filtering
        Schema::table('jobs_listing', function (Blueprint $table) {
            $table->index(['salary_min', 'salary_max'], 'idx_salary_range');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_candidate_search');
            $table->dropIndex(['email_verified_at']);
        });

        Schema::table('replies', function (Blueprint $table) {
            $table->dropIndex('idx_accepted_answer');
        });

        Schema::table('jobs_listing', function (Blueprint $table) {
            $table->dropIndex('idx_salary_range');
        });
    }
};