<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_test_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('quiz_questions')->cascadeOnDelete();
            $table->text('input')->nullable();          // stdin fed to the program
            $table->text('expected_output');            // exact expected stdout (trailing ws trimmed)
            // Sample cases are shown to the candidate ("Run tests"); the rest are hidden and graded silently.
            $table->boolean('is_sample')->default(false);
            $table->unsignedSmallInteger('weight')->default(1);
            $table->unsignedSmallInteger('order_column')->default(0);
            $table->timestamps();

            $table->index(['question_id', 'order_column']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_test_cases');
    }
};
