<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Per-reporter dedup for interview-review reports — one report per user
        // per review, so a single user can't push a review past the auto-hide
        // threshold by reporting it repeatedly.
        Schema::create('review_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_review_id')->constrained('interview_reviews')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['interview_review_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_reports');
    }
};
