# DevRank — Session Handoff

_Last updated: 2026-09-18. Read `CLAUDE.md` first for durable project context; `docs/FUNCTIONALITY.md` for the full feature/role spec._

## Where things are
- Branch **`main`**. Working tree has **~90+ uncommitted files from this session** — build passes, verified working, **not yet committed/pushed** (owner pushes directly). **Committing is the top pending action.**
- Last commit before this session: `6a754c9` (docs: CLAUDE.md + handoff).
- Env note: XAMPP **MySQL** and a `php artisan serve` on **:8123** were restarted mid-session (MySQL had stopped); both running.

## What this session did (4-phase pass: UI motion → gap-fill → testing → docs)

### 1. Industry-standard UI/UX motion layer (all pages)
Built a reusable, **reduced-motion-safe, no-JS-safe** system (see CLAUDE.md “Frontend motion & interaction layer”) and applied it across the whole app:
- **New:** `resources/css/animations.css`, `resources/js/lib/reveal.js`, `resources/js/Components/CountUp.jsx`; wired into `resources/js/app.jsx` + `app.css`.
- Scroll/load reveals + stagger, count-up stats, growing score/rank/pillar/pipeline meters, hover-lift cards, button press feedback, a “live” pulse, page-enter transitions.
- Applied to Home (flagship, hand-tuned) + all 40 pages (leaderboard, profiles, dashboards, quiz, forum, jobs, interviews, interests, auth, admin). Visually verified on Home, Job Board, Leaderboard, both dashboards, Applicants, Admin Categories, Interview Board, forum/quiz.

### 2. Gap-fill (senior design-engineer pass)
- **Company applicant view (was the biggest missing feature):** `GET /company/jobs/{job}/applicants` → `Company/Jobs/Applicants.jsx`; move applicants through the pipeline via `PUT /company/applications/{application}/status` (owner-scoped, rejection reason capture). New `JobService::getJobApplicants/getRecentApplicants/updateApplicationStatus`. Linked from the job list + dashboard “Review”.
- **Company dashboard → real data:** `DashboardService::getCompanyStats` now returns real pipeline/trust/outreach/expiring-jobs/recent-applicants; page rewritten to consume them (removed hardcoded pipeline, fake trust pillars, fake alerts).
- **Admin forum-category CRUD:** `/admin/categories` (+ store/update/destroy/toggle) → `Admin/Categories.jsx`, nav item added. Delete blocked while a category has topics.
- **Integrity fixes:** removed the cosmetic **“+15 pts”** interview-review nudge (no such award exists); fixed **double page titles** (`app.jsx` already appends “— DevRank”; 9 pages were double-appending); **deleted dead** `Dashboard/AdminDashboard.jsx` (nothing rendered it — live admin dashboard is `Admin/Dashboard.jsx`).

### 3. Manual-tester pass — all clean
- **Route audit:** every public + authenticated route returns **200** for the correct role (candidate/company/admin), incl. the new applicant & category pages. Owner-guards verified (e.g. quiz result 403 for non-owner, 200 for owner).
- **Write-flow smoke tests (tinker, rolled back):** forum reply +5 / like +10 / accept +50; job apply (+monthly counter); interest send → accept writes a **ProfileViewLog** (+1); interview create; category delete-guard (blocked with topics) + toggle. All correct.
- **No JS console errors** on 5 diverse pages.
- Note: a stat briefly showing a low value in a screenshot is **CountUp mid-animation, not a bug** — verify in DB/tinker.

### 4. Docs
- Added **`docs/FUNCTIONALITY.md`** (full feature/role spec, reconstructed from code) + a shareable Artifact.
- Updated `CLAUDE.md` (motion layer, new features, browser-testing/curl-audit notes) and this file.

## Notes / minor issues (not blockers)
- **Demo jobs go stale:** the seed is time-anchored, so jobs seeded weeks ago expire and the board looks empty. Not a code bug — **re-seed before demo/staging** (`php artisan migrate:fresh --seed`). (I refreshed the current active jobs’ expiry in this DB for testing.)
- **`applications_count` column is demo-random**, decoupled from actual application rows in the seed (real applies increment it correctly). So a job card badge may show a higher number than the real applicant list. Cosmetic; consider backfilling `applications_count` from real rows in a seeder tweak if it matters for demo.
- **Test-data left in this DB** (harmless, resets on re-seed): a “Machine Learning” forum category; one application moved to `reviewing`; active jobs’ expiry refreshed.
- A background `php artisan serve` was running on **:8123** for testing.

## Optional/low-priority items — DONE (this pass)
- **Interview reviews now award rank points** — `points.interview_review` (default 15), awarded on create, reversed on delete (floored at 0). Honest "+15 pts" nudge restored.
- **Perf:** candidate untaken-quiz count now `whereDoesntHave` (no more pull-all-ids `whereNotIn`); admin analytics merges the two per-week user-role queries into one grouped query.
- **AiScoringService is config-driven** (`config('devrank.ai.*')`: model, threshold, blend weights, timeout, `flag_on_api_failure`). Fallback fixed: on API outage it flags via the paste/typing heuristic so blatant paste-cheating is still caught (was: neutral 5.0 that silently passed).
- **JS bundle code-split** (`vite.config.js` manualChunks): main app chunk **~1 MB → 291 KB**, `charts`(recharts) + `monaco` isolated, no >500 KB warning. ⚠️ Keep React/ReactDOM/Inertia in ONE chunk — a first attempt split React's internals and blanked the app (`Cannot set properties of undefined (setting 'Activity')`); fixed by only peeling recharts/monaco.

## Forum rich-text editor — DONE (final original-plan gap closed)
- **WYSIWYG editor** on forum topic create + reply + edit: `resources/js/Components/RichTextEditor.jsx` (TipTap — bold/italic/strike, H2/H3, lists, quote, code block, link, image). **React.lazy-loaded** → its own `RichTextEditor` chunk (~378 KB), NOT in the main bundle.
- **Server-side sanitization** is the XSS boundary: `app/Services/HtmlSanitizer.php` (HTMLPurifier) cleans every body on save in `ForumService`. Verified: `<script>`, `onclick`, `javascript:` hrefs, `<iframe>` all stripped; formatting/links/`/storage` images kept.
- **Image upload:** `POST /forum/upload-image` (candidate-only) → `storage/app/public/forum-images`, returns `{url}`. Verified end-to-end (HTTP 200, file stored).
- Bodies now render via `dangerouslySetInnerHTML` + `.rich-content` (`resources/css/components/rich-editor.css`). Length validated on stripped text.
- **New deps:** `ezyang/htmlpurifier` (composer, installed with `--ignore-platform-reqs`), `@tiptap/*` (npm). ⚠️ composer here needs `--ignore-platform-reqs` (lock pins symfony v8 / PHP 8.4; runtime is 8.2).

## Phase-1 AI bypass — DONE (launch with no API key / no cost)
- **Master switch `DEVRANK_AI_ENABLED` (default `false`)** → `config('devrank.ai.enabled')`, shared to React as `aiEnabled`.
- When off: **quizzes are MCQ-only** — coding questions are filtered out of `getQuizForAttempt` + the completion denominator, and `gradeCoding` short-circuits so **no Anthropic API calls happen**. Admin quiz builder blocks coding questions (`Admin/QuizController@storeQuestion` + `Questions.jsx`). The **"% Human" metric is hidden** (leaderboard column, candidate dashboard → shows Profile Views instead, public profile). `human_score` naturally stays 100 (no coding answers).
- Verified: a quiz with a coding question returns MCQ-only with a corrected mark denominator; leaderboard drops the Human Score column; build clean.
- To turn AI on later: set `DEVRANK_AI_ENABLED=true` + `ANTHROPIC_API_KEY` (or, cheaper long-term, replace the LLM grader with self-hosted code execution).

## Dependency audit + fresh data — DONE
- **npm:** 13 advisories → **2** via safe `npm audit fix` (no `--force`). The 2 remaining are `dompurify` **inside `monaco-editor`** (moderate/low) — Monaco loads from CDN at runtime and this is NOT our forum sanitizer (that's server-side PHP HTMLPurifier). Fixing needs a Monaco major bump (`--force`); left as-is to avoid breaking the quiz editor. `package-lock.json` changed.
- **composer:** 52 advisories → **0** via `composer update --ignore-platform-reqs` (stayed within composer.json majors — Laravel/Symfony/Guzzle/dompdf/commonmark/phpspreadsheet patches). App re-verified after: routes load, admin/company/candidate pages 200, forum reply +5 write flow works. `composer.lock` changed. ⚠️ composer here still needs `--ignore-platform-reqs`.
- **Re-seeded** (`migrate:fresh --seed`): 30 candidates, 5 companies, **18 active non-expired jobs** (staleness gone), 3 topics/quizzes, 19 reviews, 8 categories. All pages 200.

## Engagement #1 — In-app notifications — DONE
- Migration **`user_notifications`** + `UserNotification` model + `NotificationService` + `NotificationController`; nav bell **`Components/NotificationBell.jsx`** (in `MainLayout`) with unread badge + dropdown, page `Notifications/Index.jsx`. **Polls `/notifications/feed` every 45s** (visible tab) + after each Inertia nav — no websocket infra.
- Triggers wired + verified firing (self-notify skipped): outreach received, interest accepted/declined, answer accepted, new reply on your topic, quiz passed. See CLAUDE.md “In-app notifications”.
- ⚠️ **Run `php artisan migrate`** on any DB that predates this (the `user_notifications` table). Admins don't get the bell yet (AdminLayout).

## Candidate contact privacy gate — DONE
- Public candidate profile now **hides `email` / `resume` / `github_url` / `linkedin_url`** unless the viewer is the candidate, an admin, or a **company whose interest that candidate ACCEPTED**. Enforced server-side in `PublicProfileService::getCandidateProfile` (`canViewContact` nulls the fields — real boundary, not a UI hide). Page reads `contact_unlocked`. Verified for guest / other-candidate / company-without-accept (locked, nulled) and accepted-company / self / admin (unlocked). Applicant-view résumé (candidates who applied) intentionally NOT gated — they consented by applying.

## Still deferred / open
- **Commit & push** ~90+ files (top action — nothing is on `main` yet).
- **Owner action before staging:** `APP_URL`, `APP_DEBUG=false`, real SMTP, `LOG_LEVEL=warning`. **`ANTHROPIC_API_KEY` is NOT required for phase 1** (leave `DEVRANK_AI_ENABLED=false`).
- **Engagement roadmap (requested, not built):** #2 **seasons / leagues / weekly challenges**, #3 **skill paths**.
- Other suggested standout features (not built): code-execution grading (Judge0), verifiable rank badges, bias-reduced hiring, smart matching, AI mock-interview, GitHub/SO import.
- Optional: bump `monaco-editor` (last 2 npm advisories); WebSocket push (Reverb) to replace notification polling; give admins the notification bell.

## To pick up in a fresh session
1. `git status` — review/commit this session’s work (~90+ files); `npm run build` is current but re-run if unsure. Run `php artisan migrate` (notifications table) on any older DB.
2. If demo data looks empty/stale: `php artisan migrate:fresh --seed`.
3. Continue the engagement roadmap: **#2 seasons/leagues**, then **#3 skill paths**.
4. For staging: owner `.env` (no API key needed for phase 1), then deploy.
