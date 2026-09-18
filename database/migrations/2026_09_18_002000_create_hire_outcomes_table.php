<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Verified hire outcomes (#11): a two-sided confirmation that a hire
        // actually happened, plus the real offer figure. One outcome per
        // application. Salary is only surfaced in aggregate transparency data
        // when the candidate opts in (`salary_shared`).
        Schema::create('hire_outcomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->constrained('job_applications')->cascadeOnDelete()->unique();
            $table->foreignId('company_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained('users')->cascadeOnDelete();

            $table->string('role_title');                 // snapshot of the job title at hire time
            $table->string('experience_level')->nullable(); // snapshot for salary-transparency bucketing

            // Real offer figure. Optional at record time; the candidate can also
            // decline to have it shared even when present.
            $table->unsignedBigInteger('offered_salary')->nullable();
            $table->string('salary_currency', 3)->default('INR');
            $table->enum('salary_period', ['yearly', 'monthly'])->default('yearly');
            $table->date('starts_on')->nullable();

            // pending  = company claimed the hire, awaiting candidate confirmation
            // verified = both sides confirmed
            // declined = candidate said this hire did not happen
            $table->enum('status', ['pending', 'verified', 'declined'])->default('pending');

            // Candidate consent to include their compensation in public,
            // aggregate-only salary transparency data (DPDP: explicit opt-in).
            $table->boolean('salary_shared')->default(false);

            $table->timestamp('company_confirmed_at')->nullable();
            $table->timestamp('candidate_confirmed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'salary_shared']);
            $table->index('company_id');
            $table->index('candidate_id');
        });

        // Extend the application pipeline enum with a terminal "hired" stage.
        DB::statement("ALTER TABLE job_applications MODIFY COLUMN status ENUM('applied','reviewing','shortlisted','interview','offered','rejected','withdrawn','hired') NOT NULL DEFAULT 'applied'");
    }

    public function down(): void
    {
        Schema::dropIfExists('hire_outcomes');

        // Revert any hired rows so the narrowed enum can be applied cleanly.
        DB::statement("UPDATE job_applications SET status = 'offered' WHERE status = 'hired'");
        DB::statement("ALTER TABLE job_applications MODIFY COLUMN status ENUM('applied','reviewing','shortlisted','interview','offered','rejected','withdrawn') NOT NULL DEFAULT 'applied'");
    }
};
