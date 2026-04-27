<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Add max_attempts to quizzes ───────────────────────
        Schema::table('quizzes', function (Blueprint $table) {
            $table->unsignedTinyInteger('max_attempts')
                ->default(1)
                ->after('total_marks')
                ->comment('0 = unlimited, 1 = one attempt only, 2+ = configurable');
        });

        // ── 2. Drop the unique constraint from quiz_attempts ─────
        // Previously enforced one row per user+quiz at DB level.
        // Now enforced in service layer to support multiple attempts.
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'quiz_id']);

            // Track which attempt number this is (1st, 2nd, 3rd...)
            $table->unsignedTinyInteger('attempt_number')
                ->default(1)
                ->after('quiz_id');

            // Points awarded only for improvement over previous best
            // NULL means no previous attempt existed
            $table->unsignedSmallInteger('previous_best_score')
                ->nullable()
                ->after('rank_points_awarded')
                ->comment('Score of best previous attempt at time of this attempt');

            // New composite unique: one row per user + quiz + attempt_number
            $table->unique(['user_id', 'quiz_id', 'attempt_number'], 'unique_attempt_per_user_quiz');
        });
    }

    public function down(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropUnique('unique_attempt_per_user_quiz');
            $table->dropColumn(['attempt_number', 'previous_best_score']);
            $table->unique(['user_id', 'quiz_id']);
        });

        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn('max_attempts');
        });
    }
};