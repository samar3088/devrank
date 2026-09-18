<?php

namespace App\Http\Controllers;

use App\Services\AccountService;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function __construct(
        private AccountService $accountService,
        private AuthService $authService,
    ) {}

    /**
     * Account & privacy settings — DPDP self-service (export / erasure).
     */
    public function settings(Request $request)
    {
        return Inertia::render('Settings/Account', [
            'grievanceEmail' => config('devrank.privacy.grievance_email'),
        ]);
    }

    /**
     * Right to access / portability — stream all personal data as a JSON file.
     */
    public function exportData(Request $request)
    {
        // Streamed (chunked) download — memory stays bounded regardless of how
        // much content the user has authored.
        return $this->accountService->streamExport($request->user());
    }

    /**
     * Right to erasure — delete/anonymise the account. Password-confirmed.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->input('password'), $user->password)) {
            return back()->withErrors(['password' => 'The password is incorrect.']);
        }

        $this->accountService->eraseAccount($user);
        $this->authService->logout();

        return redirect('/')->with('success', 'Your account and personal data have been deleted.');
    }
}
