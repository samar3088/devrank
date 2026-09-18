<?php

namespace App\Services;

use App\Models\InterestRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

/**
 * Bias-reduced hiring (#3). A candidate can opt into "anonymous" mode: their
 * identity (name / avatar / location) is masked in discovery until a company
 * earns mutual interest, so companies evaluate on rank + verified skill first.
 *
 * Enforced SERVER-SIDE (masked data never reaches an unauthorised client). The
 * "mutual interest" rule is the single source of truth for both the identity
 * mask and the contact-detail gate: reveal to the candidate themselves, an
 * admin, or a company whose interest this candidate has ACCEPTED.
 */
class AnonymityService
{
    /** May this viewer see candidate #id's real identity / contact details? */
    public function canReveal(int $candidateId, ?User $viewer = null): bool
    {
        $viewer ??= Auth::user();
        if (! $viewer) {
            return false;
        }
        if ($viewer->id === $candidateId) {
            return true;
        }
        if ($viewer->hasRole(['super_admin', 'sub_admin'])) {
            return true;
        }
        if ($viewer->hasRole('company')) {
            return InterestRequest::where('company_id', $viewer->id)
                ->where('candidate_id', $candidateId)
                ->where('status', 'accepted')
                ->exists();
        }
        return false;
    }

    /**
     * Batch reveal set for a viewer (for lists like the leaderboard, to avoid an
     * N-query per-candidate check). Returns 'all' for admins, or an array of the
     * candidate ids a company may reveal (its accepted interests), or [] for
     * guests / other candidates.
     */
    public function revealSet(?User $viewer = null): string|array
    {
        $viewer ??= Auth::user();
        if (! $viewer) {
            return [];
        }
        if ($viewer->hasRole(['super_admin', 'sub_admin'])) {
            return 'all';
        }
        if ($viewer->hasRole('company')) {
            return InterestRequest::where('company_id', $viewer->id)
                ->where('status', 'accepted')
                ->pluck('candidate_id')
                ->map(fn ($id) => (int) $id)
                ->all();
        }
        return [];
    }

    /**
     * Should candidate #id be masked for this viewer, given a precomputed reveal
     * set (from revealSet) and the candidate's own anonymous flag?
     */
    public function shouldMask(int $candidateId, bool $isAnonymous, string|array $revealSet, ?User $viewer = null): bool
    {
        if (! $isAnonymous) {
            return false;
        }
        $viewer ??= Auth::user();
        if ($viewer && $viewer->id === $candidateId) {
            return false;
        }
        if ($revealSet === 'all') {
            return false;
        }
        return ! in_array($candidateId, (array) $revealSet, true);
    }

    /** Stable, non-reversible pseudonym for a masked candidate. */
    public function handle(int $candidateId): string
    {
        return 'Candidate #' . strtoupper(substr(md5('devrank-anon-' . $candidateId), 0, 4));
    }

    /** Two-char initials for a masked avatar. */
    public function maskedInitials(int $candidateId): string
    {
        return substr(strtoupper(md5('devrank-anon-' . $candidateId)), 0, 2);
    }
}
