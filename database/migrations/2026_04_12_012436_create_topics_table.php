<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('body');
            $table->enum('status', ['open', 'closed', 'moderated'])->default('open');
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_hot')->default(false);
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('replies_count')->default(0);
            $table->unsignedInteger('likes_count')->default(0);
            $table->timestamp('last_reply_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category_id', 'status']);
            $table->index(['is_pinned', 'created_at']);
            $table->index('last_reply_at');
            $table->index('views_count');
            $table->fullText(['title', 'body']);
        });

        Schema::create('topic_tag', function (Blueprint $table) {
            $table->foreignId('topic_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['topic_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('topic_tag');
        Schema::dropIfExists('topics');
    }
};