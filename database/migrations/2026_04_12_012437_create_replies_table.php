<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_accepted')->default(false);
            $table->enum('status', ['visible', 'moderated', 'flagged'])->default('visible');
            $table->string('moderation_reason')->nullable();
            $table->unsignedInteger('likes_count')->default(0);
            $table->decimal('ai_score', 5, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['topic_id', 'status', 'created_at']);
            $table->index(['user_id', 'likes_count']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('replies');
    }
};