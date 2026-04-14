<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get('/', function () {
    return Inertia::render('Home');
});

// Redirect /login and /register to /account
Route::get('/login', fn () => redirect('/account'))->name('login.redirect');
Route::get('/register', fn () => redirect('/account'));

// Account page — shows login/register if guest, redirects to dashboard if logged in
Route::get('/account', [AuthController::class, 'showAccount'])->name('account');

// Auth form submissions (guest only)
Route::middleware('guest')->group(function () {
    Route::post('/account/register', [AuthController::class, 'register'])->name('register');
    Route::post('/account/login', [AuthController::class, 'login'])->name('login');

    // Password reset
    Route::get('/forgot-password', [PasswordResetController::class, 'showForgotForm'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])->name('password.email');
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'showResetForm'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->name('password.update');
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Email verification
    Route::get('/email/verify', [EmailVerificationController::class, 'notice'])
        ->name('verification.notice');
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware('signed')
        ->name('verification.verify');
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1')
        ->name('verification.send');
});

// Authenticated + Verified routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Company routes
    Route::middleware('role:company')->prefix('company')->name('company.')->group(function () {
        Route::get('/jobs', [\App\Http\Controllers\Company\JobController::class, 'index'])->name('jobs.index');
        Route::get('/jobs/create', [\App\Http\Controllers\Company\JobController::class, 'create'])->name('jobs.create');
        Route::post('/jobs', [\App\Http\Controllers\Company\JobController::class, 'store'])->name('jobs.store');
        Route::get('/jobs/{job}/edit', [\App\Http\Controllers\Company\JobController::class, 'edit'])->name('jobs.edit');
        Route::put('/jobs/{job}', [\App\Http\Controllers\Company\JobController::class, 'update'])->name('jobs.update');
        Route::delete('/jobs/{job}', [\App\Http\Controllers\Company\JobController::class, 'destroy'])->name('jobs.destroy');

        Route::get('/profile', [\App\Http\Controllers\Company\ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [\App\Http\Controllers\Company\ProfileController::class, 'update'])->name('profile.update');
        Route::post('/profile/logo', [\App\Http\Controllers\Company\ProfileController::class, 'updateLogo'])->name('profile.logo');
    });
});