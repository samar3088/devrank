<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Register a new user
     * First user automatically becomes super_admin
     */
    public function register(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // First user becomes super_admin
        if (User::count() === 1) {
            $user->assignRole('super_admin');
        } else {
            $user->assignRole($data['role']);
        }

        // Save role-specific fields
        if ($data['role'] === 'company') {
            $user->update(array_filter([
                'company_name' => $data['company_name'] ?? null,
                'company_website' => $data['company_website'] ?? null,
                'industry' => $data['industry'] ?? null,
            ]));
        }

        if ($data['role'] === 'candidate') {
            $user->update(array_filter([
                'headline' => $data['primary_skill'] ?? null,
                'years_of_experience' => $this->parseExperience($data['years_of_experience'] ?? null),
            ]));
        }

        event(new Registered($user));

        return $user;
    }

    /**
     * Attempt login
     * Returns array with success status and message
     */
    public function login(array $credentials, bool $remember = false): array
    {
        if (!Auth::attempt($credentials, $remember)) {
            return [
                'success' => false,
                'message' => 'The provided credentials do not match our records.',
            ];
        }

        $user = Auth::user();

        if (!$user->is_active) {
            Auth::logout();
            return [
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ];
        }

        return [
            'success' => true,
            'user' => $user,
        ];
    }

    /**
     * Logout user and invalidate session
     */
    public function logout(): void
    {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }

    /**
     * Get the dashboard route based on user role
     */
    public function getDashboardRoute(User $user): string
    {
        return '/dashboard';
    }

    /**
     * Parse experience string to integer
     */
    private function parseExperience(?string $experience): ?int
    {
        if (!$experience) return null;

        return match (true) {
            str_contains($experience, '0–1') => 0,
            str_contains($experience, '1–3') => 2,
            str_contains($experience, '3–5') => 4,
            str_contains($experience, '5–8') => 6,
            str_contains($experience, '8+') => 9,
            default => null,
        };
    }
}