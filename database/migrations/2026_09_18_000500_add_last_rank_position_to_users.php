<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Last global leaderboard position we notified this candidate about,
            // so recompute can fire a "rank up" notification only when they
            // actually climb (and never on the first baseline run).
            $table->unsignedInteger('last_rank_position')->nullable()->after('trust_score');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('last_rank_position');
        });
    }
};
