<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            // When the company first moved this application off "applied" (i.e.
            // acknowledged the candidate). NULL = still awaiting a first response.
            $table->timestamp('responded_at')->nullable()->after('company_notes');
            // Supports the SLA-breach scan: applications still "applied" past the window.
            $table->index(['status', 'responded_at'], 'idx_app_response_sla');
        });

        // Backfill: any application already past the "applied" stage has been
        // responded to — stamp responded_at from updated_at so historical data
        // isn't wrongly counted as a breach.
        DB::table('job_applications')
            ->whereNotIn('status', ['applied'])
            ->whereNull('responded_at')
            ->update(['responded_at' => DB::raw('updated_at')]);
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropIndex('idx_app_response_sla');
            $table->dropColumn('responded_at');
        });
    }
};
