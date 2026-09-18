<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            // A weekly challenge is a quiz flagged live for a window and tied to a season.
            $table->boolean('is_challenge')->default(false)->after('status');
            $table->foreignId('season_id')->nullable()->after('is_challenge')->constrained()->nullOnDelete();
            $table->timestamp('challenge_starts_at')->nullable()->after('season_id');
            $table->timestamp('challenge_ends_at')->nullable()->after('challenge_starts_at');

            $table->index(['is_challenge', 'challenge_ends_at']);
        });
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('season_id');
            $table->dropColumn(['is_challenge', 'challenge_starts_at', 'challenge_ends_at']);
        });
    }
};
