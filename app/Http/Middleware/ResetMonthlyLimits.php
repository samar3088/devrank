<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ResetMonthlyLimits
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            // Reset limits if we're in a new month
            if (!$user->limits_reset_at || $user->limits_reset_at->lt(now()->startOfMonth())) {
                $user->update([
                    'monthly_job_applications' => 0,
                    'monthly_job_posts' => 0,
                    'monthly_outreach_sent' => 0,
                    'limits_reset_at' => now()->startOfMonth(),
                ]);
            }
        }

        return $next($request);
    }
}