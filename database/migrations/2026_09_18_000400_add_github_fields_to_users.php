<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Verified GitHub identity (proves the github_url actually belongs to them).
            $table->string('github_id')->nullable()->unique()->after('github_url');
            $table->string('github_username')->nullable()->after('github_id');
            $table->timestamp('github_verified_at')->nullable()->after('github_username');
            // Imported contribution snapshot (public_repos, followers, stars, top_language, points).
            $table->json('github_stats')->nullable()->after('github_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['github_id', 'github_username', 'github_verified_at', 'github_stats']);
        });
    }
};
