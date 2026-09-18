<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('jobs:expire')->dailyAt('00:00');

// Recompute integrity/trust scores daily so applications that silently cross the
// response SLA (with no status event to trigger a recompute) still dock trust.
Schedule::command('devrank:recompute-scores')->dailyAt('02:00');