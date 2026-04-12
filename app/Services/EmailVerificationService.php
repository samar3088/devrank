<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\Events\Verified;

class EmailVerificationService
{
    /**
     * Check if user's email is already verified
     */
    public function isVerified(User $user): bool
    {
        return $user->hasVerifiedEmail();
    }

    /**
     * Attempt to verify user's email
     */
    public function verify(User $user): bool
    {
        if ($user->hasVerifiedEmail()) {
            return true;
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
            return true;
        }

        return false;
    }

    /**
     * Send verification notification
     */
    public function sendNotification(User $user): bool
    {
        if ($user->hasVerifiedEmail()) {
            return false;
        }

        $user->sendEmailVerificationNotification();
        return true;
    }
}