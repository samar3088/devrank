<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            // Which profile contact fields the candidate consented to share with
            // this employer at apply time (DPDP: explicit, per-application consent).
            // e.g. ["email","phone","location","github","linkedin"]
            $table->json('shared_fields')->nullable()->after('resume_path');
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn('shared_fields');
        });
    }
};
