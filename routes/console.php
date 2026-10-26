<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('jobs:expire')->dailyAt('00:00');

// Recompute integrity/trust scores daily so applications that silently cross the
// response SLA (with no status event to trigger a recompute) still dock trust.
Schedule::command('devrank:recompute-scores')->dailyAt('02:00');

// Drain the queue from inside the scheduler so the shared host needs only ONE cron
// (schedule:run) instead of a separate queue:work cron. Mail notifications are
// ShouldQueue; there is no persistent worker. Runs every minute in the background
// (non-blocking), self-healing (50s cap + stop-when-empty), with retries and a
// 2-minute overlap lock so a crashed worker never wedges the queue.
Schedule::command('queue:work --stop-when-empty --max-time=50 --tries=3')
    ->everyMinute()
    ->withoutOverlapping(2)
    ->runInBackground();