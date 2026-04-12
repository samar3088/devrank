<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jobs_listing_id')->constrained('jobs_listing')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('cover_letter')->nullable();
            $table->string('resume_path')->nullable();
            $table->enum('status', ['applied', 'reviewing', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn'])->default('applied');
            $table->text('rejection_reason')->nullable();
            $table->text('company_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['jobs_listing_id', 'user_id']);
            $table->index(['user_id', 'status']);
            $table->index(['jobs_listing_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};