<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('interview_reviews', function (Blueprint $table) {
            $table->unsignedInteger('reports_count')->default(0)->after('likes_count');
        });
    }

    public function down(): void
    {
        Schema::table('interview_reviews', function (Blueprint $table) {
            $table->dropColumn('reports_count');
        });
    }
};
