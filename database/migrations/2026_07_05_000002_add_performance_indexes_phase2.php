<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Leaderboard "likes_received" subquery + candidate stats:
        //   Reply::where(user_id, status='visible')->sum(likes_count)
        // Covering index → index-only scan instead of scanning the user's replies.
        Schema::table('replies', function (Blueprint $table) {
            $table->index(['user_id', 'status', 'likes_count'], 'idx_replies_user_status_likes');
        });

        // Weekly rank history + admin analytics:
        //   quiz_attempts where status='completed' and completed_at >= <8 weeks ago>
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->index(['status', 'completed_at'], 'idx_quiz_attempts_status_completed');
        });

        // Interview board listing: where status='visible' [filters] order by created_at desc
        // Existing (status,outcome) doesn't help the created_at ordering.
        Schema::table('interview_reviews', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'idx_interview_reviews_status_created');
        });
    }

    public function down(): void
    {
        Schema::table('replies', function (Blueprint $table) {
            $table->dropIndex('idx_replies_user_status_likes');
        });
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropIndex('idx_quiz_attempts_status_completed');
        });
        Schema::table('interview_reviews', function (Blueprint $table) {
            $table->dropIndex('idx_interview_reviews_status_created');
        });
    }
};
