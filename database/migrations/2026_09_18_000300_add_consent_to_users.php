<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // DPDP: timestamp the user gave informed consent to the privacy notice
            // at registration. NULL = legacy account that predates consent capture.
            $table->timestamp('consented_at')->nullable()->after('is_active');
        });

        // Legacy accounts are treated as consented at their signup time so the app
        // doesn't lock out existing users; new signups must tick the box explicitly.
        DB::table('users')->whereNull('consented_at')->update([
            'consented_at' => DB::raw('created_at'),
        ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('consented_at');
        });
    }
};
