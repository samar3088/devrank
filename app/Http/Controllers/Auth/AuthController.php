<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * Show register & login page
     */
    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle registration
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'role' => ['required', 'in:candidate,company'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'company_website' => ['nullable', 'url', 'max:255'],
            'industry' => ['nullable', 'string', 'max:255'],
            'primary_skill' => ['nullable', 'string', 'max:255'],
            'years_of_experience' => ['nullable', 'string'],
        ]);

        $user = $this->authService->register($validated);

        Auth::login($user);
        $request->session()->regenerate();

        $redirect = $this->authService->getDashboardRoute($user);

        return redirect()->intended($redirect);
    }

    /**
     * Handle login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $result = $this->authService->login(
            $request->only('email', 'password'),
            $request->boolean('remember')
        );

        if (!$result['success']) {
            return back()->withErrors([
                'email' => $result['message'],
            ])->onlyInput('email');
        }

        $request->session()->regenerate();

        $redirect = $this->authService->getDashboardRoute($result['user']);

        return redirect()->intended($redirect);
    }

    /**
     * Handle logout
     */
    public function logout()
    {
        $this->authService->logout();

        return redirect('/');
    }
}