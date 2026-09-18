<?php

namespace App\Http\Controllers;

use App\Services\CredentialService;
use Illuminate\Http\Request;

/**
 * Candidate-side controls for their verifiable rank credential (mint/rotate/revoke).
 * The badge + verify page themselves are public (BadgeController / VerifyController).
 */
class CredentialController extends Controller
{
    public function __construct(private CredentialService $credentials) {}

    /** Mint a token on first "share" (opt-in — not minted for everyone). */
    public function store(Request $request)
    {
        $this->credentials->ensureToken($request->user());
        return back()->with('success', 'Your verified badge is ready to embed.');
    }

    /** Rotate — invalidates existing embeds and issues a fresh token. */
    public function rotate(Request $request)
    {
        $this->credentials->rotate($request->user());
        return back()->with('success', 'Badge link rotated. Update any embeds with the new link.');
    }

    /** Revoke — all embeds stop working. */
    public function destroy(Request $request)
    {
        $this->credentials->revoke($request->user());
        return back()->with('success', 'Your verified badge has been revoked.');
    }
}
