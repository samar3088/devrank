<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs_listing', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->text('benefits')->nullable();
            $table->enum('job_type', ['full-time', 'part-time', 'contract', 'freelance', 'internship'])->default('full-time');
            $table->enum('work_mode', ['remote', 'onsite', 'hybrid'])->default('onsite');
            $table->string('location')->nullable();
            $table->string('experience_level')->nullable();
            $table->string('experience_range')->nullable();
            $table->unsignedInteger('salary_min')->nullable();
            $table->unsignedInteger('salary_max')->nullable();
            $table->string('salary_currency', 3)->default('INR');
            $table->string('salary_period')->default('yearly');
            $table->enum('status', ['draft', 'active', 'expired', 'closed'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('applications_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'is_featured', 'published_at']);
            $table->index(['job_type', 'work_mode']);
            $table->index('expires_at');
            $table->fullText(['title', 'description']);
        });

        Schema::create('job_tag', function (Blueprint $table) {
            $table->foreignId('jobs_listing_id')->constrained('jobs_listing')->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['jobs_listing_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_tag');
        Schema::dropIfExists('jobs_listing');
    }
};