<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The company job-edit form and the admin job-status action both allow
     * "paused", but it was missing from the column enum — setting it threw
     * "Data truncated for column 'status'".
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE jobs_listing MODIFY COLUMN status ENUM('draft','active','paused','expired','closed') NOT NULL DEFAULT 'draft'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE jobs_listing MODIFY COLUMN status ENUM('draft','active','expired','closed') NOT NULL DEFAULT 'draft'");
    }
};
