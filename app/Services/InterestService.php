<?php

namespace App\Services;

use App\Models\InterestRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class InterestService
{
    /**
     * Get all interest requests received by the authenticated candidate.
     */
    public function getCandidateRequests(): array
    {
        $requests = InterestRequest::with(['company:id,name,company_name,avatar'])
            ->where('candidate_id', Auth::id())
            ->orderByRaw("FIELD(status, 'pending', 'accepted', 'declined')")
            ->latest()
            ->paginate(15);

        return [
            'requests'  => $requests,
            'pending'   => $requests->getCollection()->where('status', 'pending')->count(),
        ];
    }

    /**
     * Get all interest requests sent by the authenticated company.
     */
    public function getCompanyRequests(): array
    {
        $user = Auth::user();

        $sent = InterestRequest::with(['candidate:id,name,avatar,total_rank_score'])
            ->where('company_id', $user->id)
            ->latest()
            ->paginate(15);

        // Monthly quota: how many sent this calendar month
        $sentThisMonth = InterestRequest::where('company_id', $user->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $monthlyLimit = config('devrank.company_interest_limit', 10);

        return [
            'requests'      => $sent,
            'sent_month'    => $sentThisMonth,
            'monthly_limit' => $monthlyLimit,
            'remaining'     => max(0, $monthlyLimit - $sentThisMonth),
        ];
    }

    /**
     * Company sends an interest request to a candidate.
     */
    public function sendInterest(User $candidate, string $message): array
    {
        $company = Auth::user();

        // Cannot send to self
        if ($company->id === $candidate->id) {
            return ['success' => false, 'message' => 'Invalid request.'];
        }

        // Already sent (any status)
        $exists = InterestRequest::where('company_id', $company->id)
            ->where('candidate_id', $candidate->id)
            ->exists();

        if ($exists) {
            return ['success' => false, 'message' => 'You have already sent an interest request to this candidate.'];
        }

        // Monthly limit check
        $sentThisMonth = InterestRequest::where('company_id', $company->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $limit = config('devrank.company_interest_limit', 10);

        if ($sentThisMonth >= $limit) {
            return ['success' => false, 'message' => "Monthly interest limit ({$limit}) reached. Resets on the 1st of next month."];
        }

        InterestRequest::create([
            'company_id'   => $company->id,
            'candidate_id' => $candidate->id,
            'message'      => $message,
            'status'       => 'pending',
        ]);

        return ['success' => true, 'message' => 'Interest request sent successfully.'];
    }

    /**
     * Candidate responds to an interest request (accept or decline).
     */
    public function respond(InterestRequest $request, string $action): array
    {
        $candidate = Auth::user();

        if ($request->candidate_id !== $candidate->id) {
            return ['success' => false, 'message' => 'Unauthorized.'];
        }

        if ($request->status !== 'pending') {
            return ['success' => false, 'message' => 'This request has already been responded to.'];
        }

        if (!in_array($action, ['accepted', 'declined'])) {
            return ['success' => false, 'message' => 'Invalid action.'];
        }

        $request->update(['status' => $action]);

        // Log profile view when accepted
        if ($action === 'accepted') {
            \App\Models\ProfileViewLog::create([
                'viewer_id'  => $request->company_id,
                'profile_id' => $candidate->id,
                'source'     => 'interest_accept',
            ]);
        }

        $msg = $action === 'accepted'
            ? 'Interest accepted. The company can now view your full profile.'
            : 'Interest declined.';

        return ['success' => true, 'message' => $msg];
    }

    /**
     * Check if the authenticated company has already sent interest to a candidate.
     */
    public function interestStatus(int $candidateId): ?string
    {
        $req = InterestRequest::where('company_id', Auth::id())
            ->where('candidate_id', $candidateId)
            ->first();

        return $req?->status;
    }
}