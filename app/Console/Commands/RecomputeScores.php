<?php

namespace App\Console\Commands;

use App\Services\ScoreService;
use Illuminate\Console\Command;

class RecomputeScores extends Command
{
    protected $signature = 'devrank:recompute-scores';

    protected $description = 'Recompute human_score (candidates) and trust_score (companies) for all users';

    public function handle(ScoreService $scores): int
    {
        $this->info('Recomputing integrity/trust scores…');
        $result = $scores->recomputeAll();
        $this->info("Done. Candidates: {$result['candidates']}, Companies: {$result['companies']}.");

        return self::SUCCESS;
    }
}
