<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interview_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('company_name');
            $table->string('role_applied');
            $table->date('interview_date');
            $table->unsignedTinyInteger('rounds_count')->default(1);
            $table->json('rounds_detail')->nullable();
            $table->enum('outcome', ['selected', 'rejected', 'ghosted', 'pending'])->default('pending');
            $table->unsignedTinyInteger('difficulty_rating')->default(3);
            $table->unsignedTinyInteger('experience_rating')->default(3);
            $table->text('tips')->nullable();
            $table->enum('status', ['visible', 'moderated'])->default('visible');
            $table->unsignedInteger('likes_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'outcome']);
            $table->index(['company_name', 'status']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_reviews');
    }
};