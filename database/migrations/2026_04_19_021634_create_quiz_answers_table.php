<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')
                ->references('id')->on('quiz_attempts')
                ->cascadeOnDelete();
            $table->foreignId('question_id')
                ->references('id')->on('quiz_questions')
                ->cascadeOnDelete();
            $table->foreignId('selected_option_id')
                ->nullable()
                ->references('id')->on('quiz_options')
                ->nullOnDelete();
            $table->text('answer_text')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->unsignedSmallInteger('marks_awarded')->default(0);
            $table->decimal('ai_score', 4, 2)->default(0);
            $table->boolean('ai_flagged')->default(false);
            $table->unsignedSmallInteger('paste_count')->default(0);
            $table->unsignedInteger('time_spent_seconds')->default(0);
            $table->timestamps();

            // One answer per question per attempt
            $table->unique(['attempt_id', 'question_id']);
            $table->index('attempt_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_answers');
    }
};