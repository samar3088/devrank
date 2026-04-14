<?php

namespace App\Console\Commands;

use App\Models\JobListing;
use Illuminate\Console\Command;

class ExpireJobs extends Command
{
    protected $signature = 'jobs:expire';
    protected $description = 'Mark expired job listings as expired';

    public function handle(): int
    {
        $count = JobListing::where('status', 'active')
            ->where('expires_at', '<', now())
            ->update(['status' => 'expired']);

        $this->info("Expired {$count} job(s).");
        return Command::SUCCESS;
    }
}