<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // company_name is matched on every interview-review event and score
        // recompute (ScoreService::updateTrustScoreForCompany /
        // recomputeAll) — User::role('company')->where('company_name', …).
        // Previously an unindexed full scan of users.
        Schema::table('users', function (Blueprint $table) {
            $table->index('company_name', 'idx_users_company_name');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_company_name');
        });
    }
};
