<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->enum('type', ['mcq', 'coding']);
            $table->string('language')->nullable();
            $table->text('starter_code')->nullable();
            $table->unsignedSmallInteger('marks')->default(10);
            $table->unsignedSmallInteger('order_column')->default(0);
            $table->text('explanation')->nullable();
            $table->timestamps();

            $table->index(['quiz_id', 'order_column']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_questions');
    }
};