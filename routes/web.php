<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\InterestController;
use App\Http\Controllers\JobBoardController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\PublicProfileController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\QuizAttemptController;
use App\Http\Controllers\Admin\QuizController as AdminQuizController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── Public ───────────────────────────────────────────────────────
Route::get('/', fn () => Inertia::render('Home'));

Route::get('/login',    fn () => redirect('/account'))->name('login.redirect');
Route::get('/register', fn () => redirect('/account'));
Route::get('/account',  [AuthController::class, 'showAccount'])->name('account');

// ── Guest only ───────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::post('/account/register',      [AuthController::class, 'register'])->name('register');
    Route::post('/account/login',         [AuthController::class, 'login'])->name('login');
    Route::get('/forgot-password',        [PasswordResetController::class, 'showForgotForm'])->name('password.request');
    Route::post('/forgot-password',       [PasswordResetController::class, 'sendResetLink'])->name('password.email');
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'showResetForm'])->name('password.reset');
    Route::post('/reset-password',        [PasswordResetController::class, 'resetPassword'])->name('password.update');
});

// ── Forum public (create BEFORE {slug} catch-all) ────────────────
Route::get('/forum/create', [ForumController::class, 'create'])
    ->middleware(['auth', 'verified', 'role:candidate'])
    ->name('forum.create');

Route::get('/forum',        [ForumController::class, 'index'])->name('forum.index');
Route::get('/forum/{slug}', [ForumController::class, 'show'])->name('forum.show');

// ── Public jobs ──────────────────────────────────────────────────
Route::get('/jobs',        [JobBoardController::class, 'index'])->name('jobs.index');
Route::get('/jobs/{slug}', [JobBoardController::class, 'show'])->name('jobs.show');

// ── Public leaderboard + profiles ────────────────────────────────
Route::get('/leaderboard',    [LeaderboardController::class, 'index'])->name('leaderboard.index');
Route::get('/candidate/{id}', [PublicProfileController::class, 'candidateProfile'])->name('profile.candidate');
Route::get('/company/{id}',   [PublicProfileController::class, 'companyProfile'])->name('profile.company');

// ── Public quiz (result BEFORE {slug} to avoid catch-all conflict) ─
Route::get('/quiz',                  [QuizController::class, 'index'])->name('quiz.index');
Route::get('/quiz/result/{attempt}', [QuizAttemptController::class, 'result'])->name('quiz.result');
Route::get('/quiz/{slug}',           [QuizController::class, 'show'])->name('quiz.show');

// ── Auth only ────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/email/verify', [EmailVerificationController::class, 'notice'])->name('verification.notice');
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware('signed')->name('verification.verify');
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1')->name('verification.send');
});

// ── Auth + Verified ──────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Forum (candidate only) ────────────────────────────────────
    Route::middleware('role:candidate')->group(function () {
        Route::post('/forum',                        [ForumController::class, 'store'])->name('forum.store');
        Route::delete('/forum/{topic}',              [ForumController::class, 'destroyTopic'])->name('forum.destroy');
        Route::post('/forum/{topic}/reply',          [ForumController::class, 'storeReply'])->name('forum.reply');
        Route::put('/forum/reply/{reply}',           [ForumController::class, 'updateReply'])->name('forum.reply.update');
        Route::delete('/forum/reply/{reply}',        [ForumController::class, 'destroyReply'])->name('forum.reply.destroy');
        Route::post('/forum/{topic}/accept/{reply}', [ForumController::class, 'acceptReply'])->name('forum.accept');
        Route::post('/forum/reply/{reply}/like',     [ForumController::class, 'toggleLike'])->name('forum.like');
    });

    // ── Jobs apply (candidate only) ───────────────────────────────
    Route::post('/jobs/{job}/apply', [JobBoardController::class, 'apply'])
        ->middleware('role:candidate')
        ->name('jobs.apply');

    // ── Interests: candidate ──────────────────────────────────────
    Route::middleware('role:candidate')->group(function () {
        Route::get('/interests',                            [InterestController::class, 'candidateIndex'])->name('interests.candidate');
        Route::post('/interests/{interestRequest}/respond', [InterestController::class, 'respond'])->name('interests.respond');
    });

    // ── Quiz attempt (candidate only) ─────────────────────────────
    Route::middleware('role:candidate')->group(function () {
        Route::post('/quiz/{quiz}/start',             [QuizAttemptController::class, 'start'])->name('quiz.start');
        Route::post('/quiz/attempt/{attempt}/answer',  [QuizAttemptController::class, 'answer'])->name('quiz.answer');
        Route::post('/quiz/attempt/{attempt}/complete',[QuizAttemptController::class, 'complete'])->name('quiz.complete');
    });

    // ── Admin quiz ────────────────────────────────────────────────
    Route::middleware('role:super_admin')->prefix('admin/quiz')->name('admin.quiz.')->group(function () {
        Route::get('/',                               [AdminQuizController::class, 'index'])->name('index');
        Route::get('/create',                         [AdminQuizController::class, 'create'])->name('create');
        Route::post('/',                              [AdminQuizController::class, 'store'])->name('store');
        Route::get('/{quiz}/edit',                    [AdminQuizController::class, 'edit'])->name('edit');
        Route::put('/{quiz}',                         [AdminQuizController::class, 'update'])->name('update');
        Route::delete('/{quiz}',                      [AdminQuizController::class, 'destroy'])->name('destroy');
        Route::get('/{quiz}/questions',               [AdminQuizController::class, 'questions'])->name('questions');
        Route::post('/{quiz}/questions',              [AdminQuizController::class, 'storeQuestion'])->name('questions.store');
        Route::delete('/{quiz}/questions/{question}', [AdminQuizController::class, 'destroyQuestion'])->name('questions.destroy');
        Route::get('/{quiz}/attempts',                [AdminQuizController::class, 'attempts'])->name('attempts');
    });

    // ── Interests: send (company, outside /company prefix) ────────
    Route::post('/interests/send/{candidate}', [InterestController::class, 'send'])
        ->middleware('role:company')
        ->name('interests.send');

    // ── Company ───────────────────────────────────────────────────
    Route::middleware('role:company')->prefix('company')->name('company.')->group(function () {
        Route::get('/jobs',            [\App\Http\Controllers\Company\JobController::class, 'index'])->name('jobs.index');
        Route::get('/jobs/create',     [\App\Http\Controllers\Company\JobController::class, 'create'])->name('jobs.create');
        Route::post('/jobs',           [\App\Http\Controllers\Company\JobController::class, 'store'])->name('jobs.store');
        Route::get('/jobs/{job}/edit', [\App\Http\Controllers\Company\JobController::class, 'edit'])->name('jobs.edit');
        Route::put('/jobs/{job}',      [\App\Http\Controllers\Company\JobController::class, 'update'])->name('jobs.update');
        Route::delete('/jobs/{job}',   [\App\Http\Controllers\Company\JobController::class, 'destroy'])->name('jobs.destroy');

        Route::get('/profile',         [\App\Http\Controllers\Company\CompanyProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile',         [\App\Http\Controllers\Company\CompanyProfileController::class, 'update'])->name('profile.update');
        Route::post('/profile/logo',   [\App\Http\Controllers\Company\CompanyProfileController::class, 'updateLogo'])->name('profile.logo');

        Route::get('/interests',       [InterestController::class, 'companyIndex'])->name('interests.index');
    });
});