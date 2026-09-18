<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Bias-reduced hiring (#3): when on, the candidate's identity
            // (name/photo/location) is hidden in discovery until a company earns
            // mutual interest — companies evaluate on rank + verified skill first.
            $table->boolean('anonymous')->default(false)->after('open_to_work');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('anonymous');
        });
    }
};
