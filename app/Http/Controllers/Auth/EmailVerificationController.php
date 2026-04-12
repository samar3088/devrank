<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\EmailVerificationService;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailVerificationController extends Controller
{
    public function __construct(
        private EmailVerificationService $verificationService
    ) {}

    /**
     * Show email verification notice page
     */
    public function notice(Request $request)
    {
        if ($this->verificationService->isVerified($request->user())) {
            return redirect('/dashboard');
        }

        return Inertia::render('Auth/VerifyEmail', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle the email verification link click
     */
    public function verify(EmailVerificationRequest $request)
    {
        $this->verificationService->verify($request->user());

        return redirect('/dashboard')->with('success', 'Email verified successfully!');
    }

    /**
     * Resend verification email
     */
    public function resend(Request $request)
    {
        $sent = $this->verificationService->sendNotification($request->user());

        if (!$sent) {
            return back()->with('status', 'already-verified');
        }

        return back()->with('status', 'verification-link-sent');
    }
}