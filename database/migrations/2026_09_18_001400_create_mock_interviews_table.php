<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mock_interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('company_name')->nullable();  // null = general practice
            $table->string('role')->nullable();
            $table->enum('status', ['in_progress', 'completed'])->default('in_progress');
            $table->boolean('ai_graded')->default(false);
            // [{round_type, question, answer, score?, feedback?}, …]
            $table->json('transcript');
            $table->unsignedTinyInteger('overall_score')->nullable(); // 0–100
            $table->text('summary')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mock_interviews');
    }
};
