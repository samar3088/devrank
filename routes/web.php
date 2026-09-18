<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\InterestController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\JobBoardController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PublicProfileController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\QuizAttemptController;
use App\Http\Controllers\Admin\AdminController;
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
    // Rate-limited to blunt credential-stuffing / brute-force / signup abuse.
    Route::post('/account/register',      [AuthController::class, 'register'])->middleware('throttle:10,1')->name('register');
    Route::post('/account/login',         [AuthController::class, 'login'])->middleware('throttle:5,1')->name('login');
    Route::get('/forgot-password',        [PasswordResetController::class, 'showForgotForm'])->name('password.request');
    Route::post('/forgot-password',       [PasswordResetController::class, 'sendResetLink'])->middleware('throttle:5,1')->name('password.email');
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'showResetForm'])->name('password.reset');
    Route::post('/reset-password',        [PasswordResetController::class, 'resetPassword'])->middleware('throttle:6,1')->name('password.update');
});

// ── Legal / privacy (public) ─────────────────────────────────────
Route::get('/privacy', [\App\Http\Controllers\LegalController::class, 'privacy'])->name('legal.privacy');
Route::get('/terms',   [\App\Http\Controllers\LegalController::class, 'terms'])->name('legal.terms');

// ── Verifiable rank credentials (public, #2) ─────────────────────
Route::get('/verify/{token}',   [\App\Http\Controllers\VerifyController::class, 'show'])->name('credential.verify');
Route::get('/badge/{token}.svg', [\App\Http\Controllers\BadgeController::class, 'show'])->name('credential.badge');

// ── Forum public — create BEFORE {slug} catch-all ─────────────────
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
Route::get('/candidate/{id}', [PublicProfileController::class, 'candidateProfile'])->whereNumber('id')->name('profile.candidate');
Route::get('/company/{id}',   [PublicProfileController::class, 'companyProfile'])->whereNumber('id')->name('profile.company');

// ── Public interview board ────────────────────────────────────────
Route::get('/interviews', [InterviewController::class, 'index'])->name('interviews.index');

// ── Seasons / leagues / weekly challenges (public, #8) ───────────
Route::get('/challenges', [\App\Http\Controllers\SeasonController::class, 'index'])->name('challenges.index');

// ── Salary transparency (public, #11) — aggregate, k-anonymised ──
Route::get('/salaries', [\App\Http\Controllers\HireController::class, 'salaries'])->name('salaries.index');

// ── Public quiz — result BEFORE {slug} to avoid catch-all conflict ─
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

    // ── DPDP data-subject rights (any authenticated user) ─────────
    Route::get('/account/settings',    [\App\Http\Controllers\AccountController::class, 'settings'])->name('account.settings');
    Route::get('/account/data-export', [\App\Http\Controllers\AccountController::class, 'exportData'])
        ->middleware('throttle:4,1')->name('account.data-export');
    Route::delete('/account',          [\App\Http\Controllers\AccountController::class, 'destroy'])->name('account.destroy');
});

// ── Auth + Verified ──────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // In-app notifications (any authenticated user)
    Route::get('/notifications',                  [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/feed',             [NotificationController::class, 'feed'])->name('notifications.feed');
    Route::post('/notifications/read-all',        [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');

    // Report an interview review (any authenticated user)
    Route::post('/interviews/{review}/report', [InterviewController::class, 'report'])->name('interviews.report');

    // ── Candidate-only ────────────────────────────────────────────
    Route::middleware('role:candidate')->group(function () {
        // GitHub import (verified rank signal)
        Route::get('/auth/github/redirect', [\App\Http\Controllers\GithubController::class, 'redirect'])->name('github.redirect');
        Route::get('/auth/github/callback', [\App\Http\Controllers\GithubController::class, 'callback'])->name('github.callback');
        // Verifiable rank credential controls (mint/rotate/revoke the badge)
        Route::post('/account/credential',        [\App\Http\Controllers\CredentialController::class, 'store'])->name('credential.store');
        Route::post('/account/credential/rotate', [\App\Http\Controllers\CredentialController::class, 'rotate'])->name('credential.rotate');
        Route::delete('/account/credential',      [\App\Http\Controllers\CredentialController::class, 'destroy'])->name('credential.destroy');
        // Smart matching — availability toggle + saved job searches (#4)
        Route::post('/candidate/open-to-work',    [\App\Http\Controllers\MatchController::class, 'toggleAvailability'])->name('candidate.availability');
        Route::post('/candidate/anonymous',       [\App\Http\Controllers\MatchController::class, 'toggleAnonymous'])->name('candidate.anonymous');
        Route::get('/skill-paths',                [\App\Http\Controllers\SkillPathController::class, 'index'])->name('skill-paths');
        // AI mock interview (#5)
        Route::get('/mock-interview',                [\App\Http\Controllers\MockInterviewController::class, 'index'])->name('mock.index');
        Route::post('/mock-interview',               [\App\Http\Controllers\MockInterviewController::class, 'store'])->middleware('throttle:10,1')->name('mock.store');
        Route::get('/mock-interview/{mock}',         [\App\Http\Controllers\MockInterviewController::class, 'show'])->name('mock.show');
        Route::post('/mock-interview/{mock}/submit', [\App\Http\Controllers\MockInterviewController::class, 'submit'])->middleware('throttle:10,1')->name('mock.submit');
        Route::post('/candidate/saved-searches',  [\App\Http\Controllers\SavedSearchController::class, 'store'])->name('saved-search.store');
        Route::delete('/candidate/saved-searches/{savedSearch}', [\App\Http\Controllers\SavedSearchController::class, 'destroy'])->name('saved-search.destroy');
        // Verified hire outcomes (#11) — confirm/decline a hire a company recorded
        Route::get('/hires',                         [\App\Http\Controllers\HireController::class, 'index'])->name('hires.index');
        Route::post('/hires/{hireOutcome}/confirm',  [\App\Http\Controllers\HireController::class, 'confirm'])->name('hires.confirm');
        Route::post('/hires/{hireOutcome}/decline',  [\App\Http\Controllers\HireController::class, 'decline'])->name('hires.decline');
        // Forum
        Route::post('/forum',                        [ForumController::class, 'store'])->name('forum.store');
        Route::post('/forum/upload-image',           [ForumController::class, 'uploadImage'])->name('forum.upload-image');
        Route::delete('/forum/{topic}',              [ForumController::class, 'destroyTopic'])->name('forum.destroy');
        Route::post('/forum/{topic}/reply',          [ForumController::class, 'storeReply'])->name('forum.reply');
        Route::put('/forum/reply/{reply}',           [ForumController::class, 'updateReply'])->name('forum.reply.update');
        Route::delete('/forum/reply/{reply}',        [ForumController::class, 'destroyReply'])->name('forum.reply.destroy');
        Route::post('/forum/{topic}/accept/{reply}', [ForumController::class, 'acceptReply'])->name('forum.accept');
        Route::post('/forum/reply/{reply}/like',     [ForumController::class, 'toggleLike'])->name('forum.like');
        // Jobs
        Route::post('/jobs/{job}/apply', [JobBoardController::class, 'apply'])->name('jobs.apply');
        // Interests
        Route::get('/interests',                            [InterestController::class, 'candidateIndex'])->name('interests.candidate');
        Route::post('/interests/{interestRequest}/respond', [InterestController::class, 'respond'])->name('interests.respond');
        // Quiz attempts
        Route::post('/quiz/{quiz}/start',              [QuizAttemptController::class, 'start'])->name('quiz.start');
        Route::post('/quiz/attempt/{attempt}/answer',  [QuizAttemptController::class, 'answer'])->name('quiz.answer');
        Route::post('/quiz/attempt/{attempt}/run',      [QuizAttemptController::class, 'runTests'])->middleware('throttle:20,1')->name('quiz.run');
        Route::post('/quiz/attempt/{attempt}/complete',[QuizAttemptController::class, 'complete'])->name('quiz.complete');
        // Interview Board
        Route::get('/interviews/create',      [InterviewController::class, 'create'])->name('interviews.create');
        Route::post('/interviews',            [InterviewController::class, 'store'])->name('interviews.store');
        Route::delete('/interviews/{review}', [InterviewController::class, 'destroy'])->name('interviews.destroy');
    });

    // ── Company: send interest (outside /company prefix) ──────────
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
        Route::get('/talent',          [\App\Http\Controllers\MatchController::class, 'talent'])->name('talent');
        // Applicants (view who applied + move them through the pipeline)
        Route::get('/jobs/{job}/applicants',             [\App\Http\Controllers\Company\JobController::class, 'applicants'])->name('jobs.applicants');
        Route::put('/applications/{application}/status', [\App\Http\Controllers\Company\JobController::class, 'updateApplicationStatus'])->name('applications.status');
        // Record a verified hire (#11)
        Route::post('/applications/{application}/hire',  [\App\Http\Controllers\Company\JobController::class, 'hire'])->name('applications.hire');
    });

    // ── Admin quiz — super_admin always; sub_admin when granted quizzes.manage ─
    // Deletes stay super-admin-only (quizzes.delete).
    Route::middleware('permission:quizzes.manage')->prefix('admin/quiz')->name('admin.quiz.')->group(function () {
        Route::get('/',                               [AdminQuizController::class, 'index'])->name('index');
        Route::get('/create',                         [AdminQuizController::class, 'create'])->name('create');
        Route::post('/',                              [AdminQuizController::class, 'store'])->name('store');
        Route::get('/{quiz}/edit',                    [AdminQuizController::class, 'edit'])->name('edit');
        Route::put('/{quiz}',                         [AdminQuizController::class, 'update'])->name('update');
        Route::delete('/{quiz}',                      [AdminQuizController::class, 'destroy'])->middleware('permission:quizzes.delete')->name('destroy');
        Route::get('/{quiz}/questions',               [AdminQuizController::class, 'questions'])->name('questions');
        Route::post('/{quiz}/questions',              [AdminQuizController::class, 'storeQuestion'])->name('questions.store');
        Route::post('/{quiz}/questions/bulk',         [AdminQuizController::class, 'storeQuestionsBulk'])->name('questions.bulk');
        Route::delete('/{quiz}/questions/{question}', [AdminQuizController::class, 'destroyQuestion'])->middleware('permission:quizzes.delete')->name('questions.destroy');
        Route::get('/{quiz}/attempts',                [AdminQuizController::class, 'attempts'])->name('attempts');
    });

    // ── Admin general (super_admin + sub_admin) ───────────────────
    Route::middleware('role:super_admin|sub_admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard',                          [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/analytics',                          [AdminController::class, 'analytics'])->name('analytics');
        Route::get('/users',                              [AdminController::class, 'users'])->name('users');
        Route::post('/users/{user}/toggle',               [AdminController::class, 'toggleUser'])->name('users.toggle');
        Route::get('/companies',                          [AdminController::class, 'companies'])->name('companies');
        Route::post('/companies/{company}/toggle',        [AdminController::class, 'toggleCompany'])->name('companies.toggle');
        Route::get('/jobs',                               [AdminController::class, 'jobs'])->name('jobs');
        Route::post('/jobs/{job}/featured',               [AdminController::class, 'toggleJobFeatured'])->name('jobs.featured');
        Route::post('/jobs/{job}/status',                 [AdminController::class, 'updateJobStatus'])->name('jobs.status');
        Route::get('/topics',                             [AdminController::class, 'topics'])->name('topics');
        Route::get('/moderation',                         [AdminController::class, 'moderation'])->name('moderation');
        Route::post('/moderation/{reply}',                [AdminController::class, 'moderateReply'])->name('moderation.action');
        Route::get('/tags',                               [AdminController::class, 'tags'])->name('tags');
        Route::post('/tags/{tag}/approve',                [AdminController::class, 'approveTag'])->name('tags.approve');
        Route::post('/tags/{tag}/reject',                 [AdminController::class, 'rejectTag'])->name('tags.reject');
        Route::get('/profile-logs',                       [AdminController::class, 'profileLogs'])->name('profile-logs');
        // Forum categories (CRUD)
        Route::get('/categories',                         [AdminController::class, 'categories'])->name('categories');
        Route::post('/categories',                        [AdminController::class, 'storeCategory'])->name('categories.store');
        Route::put('/categories/{category}',              [AdminController::class, 'updateCategory'])->name('categories.update');
        Route::delete('/categories/{category}',           [AdminController::class, 'destroyCategory'])->name('categories.destroy');
        Route::post('/categories/{category}/toggle',      [AdminController::class, 'toggleCategory'])->name('categories.toggle');

        // Seasons management (#8) — same permission as challenge/quiz management.
        Route::middleware('permission:quizzes.manage')->group(function () {
            Route::get('/seasons',                 [\App\Http\Controllers\Admin\SeasonController::class, 'index'])->name('seasons');
            Route::post('/seasons',                [\App\Http\Controllers\Admin\SeasonController::class, 'store'])->name('seasons.store');
            Route::post('/seasons/{season}/activate', [\App\Http\Controllers\Admin\SeasonController::class, 'activate'])->name('seasons.activate');
            Route::post('/seasons/{season}/close',    [\App\Http\Controllers\Admin\SeasonController::class, 'close'])->name('seasons.close');
            Route::delete('/seasons/{season}',     [\App\Http\Controllers\Admin\SeasonController::class, 'destroy'])->name('seasons.destroy');
        });
    });
});