<?php

namespace App\Http\Controllers;

use App\Models\HireOutcome;
use App\Services\HireService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HireController extends Controller
{
    public function __construct(private HireService $hireService) {}

    /**
     * Candidate's hires: pending confirmations + verified/declined history.
     */
    public function index()
    {
        return Inertia::render('Hires/Index', [
            'hires' => $this->hireService->forCandidate(Auth::id()),
        ]);
    }

    /**
     * Candidate confirms a hire happened, optionally opting into anonymous,
     * aggregate-only salary transparency.
     */
    public function confirm(Request $request, HireOutcome $hireOutcome)
    {
        if ($hireOutcome->candidate_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'share_salary' => ['nullable', 'boolean'],
        ]);

        $this->hireService->confirm($hireOutcome, (bool) ($validated['share_salary'] ?? false));

        return back()->with('success', 'Hire confirmed — congratulations! 🎉');
    }

    /**
     * Candidate declines: the hire did not happen.
     */
    public function decline(HireOutcome $hireOutcome)
    {
        if ($hireOutcome->candidate_id !== Auth::id()) {
            abort(403);
        }

        $this->hireService->decline($hireOutcome);

        return back()->with('success', 'Thanks — we\'ve let the company know.');
    }

    /**
     * Public salary transparency: aggregate, k-anonymised real-offer data.
     */
    public function salaries()
    {
        return Inertia::render('Salaries/Index', [
            'data' => $this->hireService->salaryTransparency(),
        ]);
    }
}
