<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['in_progress', 'completed', 'abandoned'])->default('in_progress');
            $table->unsignedSmallInteger('score')->default(0);
            $table->decimal('percentage', 5, 2)->default(0);
            $table->boolean('passed')->default(false);
            $table->unsignedInteger('time_taken_seconds')->default(0);
            $table->boolean('ai_flagged')->default(false);
            $table->unsignedSmallInteger('rank_points_awarded')->default(0);
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // One attempt per candidate per quiz — hard DB constraint
            $table->unique(['user_id', 'quiz_id']);
            $table->index(['quiz_id', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');
    }
};