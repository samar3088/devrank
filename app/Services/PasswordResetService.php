<?php

namespace App\Services;

use Illuminate\Support\Facades\Password;

class PasswordResetService
{
    /**
     * Send password reset link
     */
    public function sendResetLink(string $email): array
    {
        $status = Password::sendResetLink(['email' => $email]);

        if ($status === Password::RESET_LINK_SENT) {
            return [
                'success' => true,
                'message' => 'We have emailed your password reset link.',
            ];
        }

        return [
            'success' => false,
            'message' => $this->getErrorMessage($status),
        ];
    }

    /**
     * Reset password with token
     */
    public function resetPassword(array $data): array
    {
        $status = Password::reset($data, function ($user, $password) {
            $user->forceFill([
                'password' => bcrypt($password),
            ])->save();
        });

        if ($status === Password::PASSWORD_RESET) {
            return [
                'success' => true,
                'message' => 'Your password has been reset successfully.',
            ];
        }

        return [
            'success' => false,
            'message' => $this->getErrorMessage($status),
        ];
    }

    /**
     * Get user-friendly error message
     */
    private function getErrorMessage(string $status): string
    {
        return match ($status) {
            Password::INVALID_USER => 'We could not find a user with that email address.',
            Password::INVALID_TOKEN => 'This password reset link is invalid or has expired.',
            Password::RESET_THROTTLED => 'Please wait before requesting another reset link.',
            default => 'Something went wrong. Please try again.',
        };
    }
}