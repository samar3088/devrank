<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('season_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('season_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Sum of the candidate's best percentage per challenge in this season.
            $table->unsignedInteger('points')->default(0);
            $table->unsignedSmallInteger('challenges_completed')->default(0);
            $table->timestamps();

            $table->unique(['season_id', 'user_id']);
            $table->index(['season_id', 'points']); // season leaderboard
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('season_scores');
    }
};
