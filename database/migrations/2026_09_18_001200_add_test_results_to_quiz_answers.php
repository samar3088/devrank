<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quiz_answers', function (Blueprint $table) {
            // Objective code-execution result (Judge0). NULL for MCQ / ungraded coding.
            $table->unsignedSmallInteger('tests_passed')->nullable()->after('ai_flagged');
            $table->unsignedSmallInteger('tests_total')->nullable()->after('tests_passed');
        });
    }

    public function down(): void
    {
        Schema::table('quiz_answers', function (Blueprint $table) {
            $table->dropColumn(['tests_passed', 'tests_total']);
        });
    }
};
