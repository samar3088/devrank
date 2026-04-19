<?php

namespace App\Http\Controllers;

use App\Models\InterestRequest;
use App\Models\User;
use App\Services\InterestService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InterestController extends Controller
{
    public function __construct(protected InterestService $interestService) {}

    // ── Candidate: list incoming interest requests ──────────────
    public function candidateIndex()
    {
        $data = $this->interestService->getCandidateRequests();

        return Inertia::render('Interests/CandidateIndex', $data);
    }

    // ── Company: list sent interest requests ────────────────────
    public function companyIndex()
    {
        $data = $this->interestService->getCompanyRequests();

        return Inertia::render('Interests/CompanyIndex', $data);
    }

    // ── Company: send interest to a candidate ───────────────────
    public function send(Request $request, User $candidate)
    {
        $request->validate([
            'message' => ['required', 'string', 'min:20', 'max:500'],
        ]);

        $result = $this->interestService->sendInterest($candidate, $request->message);

        if (!$result['success']) {
            return back()->withErrors(['message' => $result['message']]);
        }

        return back()->with('success', $result['message']);
    }

    // ── Candidate: accept or decline ────────────────────────────
    public function respond(Request $request, InterestRequest $interestRequest)
    {
        $request->validate([
            'action' => ['required', 'in:accepted,declined'],
        ]);

        $result = $this->interestService->respond($interestRequest, $request->action);

        if (!$result['success']) {
            return back()->withErrors(['message' => $result['message']]);
        }

        return back()->with('success', $result['message']);
    }
}