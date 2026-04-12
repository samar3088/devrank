<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $view = $this->dashboardService->getDashboardView($user);

        // Get role-specific stats
        $stats = match (true) {
            $user->hasRole(['super_admin', 'sub_admin']) => $this->dashboardService->getAdminStats(),
            $user->hasRole('company') => $this->dashboardService->getCompanyStats($user),
            default => $this->dashboardService->getCandidateStats($user),
        };

        return Inertia::render($view, [
            'stats' => $stats,
        ]);
    }
}