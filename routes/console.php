<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('jobs:expire')->dailyAt('00:00');