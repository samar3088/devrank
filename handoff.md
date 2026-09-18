# DevRank — Session Handoff

_Last updated: 2026-09-18 (through session #6). Read `CLAUDE.md` first for durable project context; `docs/FUNCTIONALITY.md` for the full feature/role spec; `FEATURE-STATUS.md` for the roadmap scorecard._
_Session #6 (polish pass): admin Seasons UI (`f3bcd1c`), bulk coding import (`69deada`), HMAC receipt (`17910b2`), Reverb real-time (`4559b3c`). New deps: laravel/reverb, laravel-echo, pusher-js._
_Session #9: **#11 verified hire outcomes + salary transparency** — the FINAL roadmap item. Two-sided hire confirmation (`hire_outcomes` + `HireService`): company records a hire from Applicants → candidate confirms/declines on `/hires` → new terminal `hired` pipeline stage. Public `/salaries` k-anonymised (min 3) aggregate salary bands from candidate-consented verified hires; DPDP export+erasure wired; verified-hire count replaces the mock "Platform Hires" on company profiles. **Roadmap now 11/11 — COMPLETE.** New migration `hire_outcomes` (+ `job_applications.status` enum gains `hired`)._
_Session #8: **#5 AI mock-interview** (`3141389`) — `/mock-interview`; `MockInterviewService` builds questions from real board rounds/tips; AI-scored feedback when `DEVRANK_AI_ENABLED=true`, "prep mode" (no API cost) when off. New migration `mock_interviews`._
_Session #7: **#3 bias-reduced hiring** (`ef2c499`) — opt-in `users.anonymous` masks name/photo/location in discovery until mutual interest via `AnonymityService` (shared with the contact gate); enforced server-side on profile/leaderboard/Browse Talent; candidate "Go anonymous" toggle. ⚠️ New migration `users.anonymous` + `composer install`/`npm install` on any older checkout._

## Where things are (current)
- Branch **`main`**, **all work committed and pushed** to `origin/main` (latest `fe40b0d`).
- Build passes (`npm run build`), all migrations run, verified working.
- **Roadmap: 11 of 11 items built — COMPLETE** (#1–#11 ✅). See "Still pending / open" below (only owner config + optional polish remain).
- Env note: XAMPP **MySQL** was stopped and restarted this session; a `php artisan serve` runs on **:8123** for testing (stale instances get killed/restarted).

## Session #2 (2026-09-18) — roadmap execution
Delivered, each committed separately:
1. **#10 Response SLAs / "zero ghosting"** (`1e53fc6`): mandatory rejection reasons (server + UI); `job_applications.responded_at`; `trust_score` now blends ghosting + application-response breach rate (`config('devrank.sla.*')`); recompute on status change + daily schedule; Applicants view flags overdue/awaiting. **Verified:** trust 91→60 when all apps breach, back to 100 when responded.
2. **Security + DPDP** (`90dbe1d`): `SecurityHeaders` middleware; rate limiting on login/register/password-reset (verified 429 on 6th login); DPDP consent capture, `/privacy` + `/terms`, data export, account erasure (`AccountService`), `/account/settings`. Audit: `docs/SECURITY_DPDP.md`.
3. **DB audit** (`90dbe1d`): confirmed no N+1 (2–11 q/page), added `idx_users_company_name`. Schema already well-indexed (3 passes).
4. **#2 credentials** — scoped only: `docs/CREDENTIALS_SCOPE.md` (build deferred, ~2.5–3 days).
5. **Dead code** (`b7c7510`): removed unused `AuthService::getDashboardRoute`; swept pages/components/debug — otherwise clean.
6. **#6 GitHub import** (`ba19ae2`): Socialite OAuth connect, verified contribution signal, delta-model points, master switch `githubEnabled`. **Verified** points math + no double-award on re-import.

⚠️ **Run `php artisan migrate`** on any DB predating this session — 4 new migrations: `responded_at`, `idx_users_company_name`, `consented_at`, github fields.

## Session #3 (2026-09-18) — QA fixes, quick wins, #2 credentials
- **QA pass** (re-seed + full browser click-through, all roles): found + fixed 2 more bugs — trust_score never persisted (guarded column → `forceFill`), trust trigger passed null (`jobListing->user`→`company`); plus 2 UI fixes (`% human` hidden on applicants view when AI off, stale trust copy).
- **Seed cleanup**: `applications_count` now from real rows; no future "applied" dates; non-applied apps stamp `responded_at`.
- **Quick wins**: rank-up notification (`ScoreService::notifyRankChanges`, `users.last_rank_position`, daily); admin moderation notification (`notifyAdmins`, review auto-hide); **Account & Privacy** nav dropdown link.
- **#2 credentials BUILT** (`4948b18`): `/badge/{token}.svg` + `/verify/{token}` + dashboard share card. See CLAUDE.md "Verifiable rank credentials".
- ⚠️ **2 more migrations** this session: `last_rank_position`, `credential_tokens`. Re-seed done; all verified in browser.

## Session #4 (2026-09-18) — the "medium builds" trio
- **#4 Smart matching**: `MatchService` (skill×rank×exp×prefs), candidate dashboard "Top job matches" + open-to-work toggle, company `/company/talent` Browse Talent, `saved_searches` + job alerts.
- **#9 Skill paths**: `SkillPathService` + `/skill-paths` (climb/new paths → quizzes + open questions).
- **#8 Seasons/leagues/weekly challenges**: `seasons`/`season_scores`, challenge = timed season-linked quiz, Gold/Silver/Bronze leagues, public `/challenges`, **bulk question import** (`POST /admin/quiz/{quiz}/questions/bulk`). `SeasonSeeder` seeds a live season + 2 challenges.
- ⚠️ **New migrations**: `saved_searches`, `seasons`, `season_scores`, quiz challenge fields. Re-seeded (`migrate:fresh --seed`) + browser-verified `/challenges`, matches card, skill paths, Browse Talent.
- See CLAUDE.md "Smart matching / skill paths / seasons" incl. **how challenge questions are uploaded**.

## Session #5 (2026-09-18) — #1 Judge0 code execution + sub_admin quiz uploads
- **Quiz upload permission**: `admin/quiz` now `permission:quizzes.manage` (super_admin always; sub_admin granted by default; revocable). Deletes need `quizzes.delete` (super_admin only). Nav/Delete-button hidden without the permission.
- **#1 Judge0 objective code execution (`ba…`)**: `Judge0Service` runs coding submissions against hidden test cases (`question_test_cases`), storing `quiz_answers.tests_passed/tests_total`. `gradeCoding` blends Judge0 correctness + AI human-check. **Coding is unlocked when `codingEnabled()` = Judge0 OR AI** (was AI-only). Admin coding form has a test-case editor; candidate attempt has "▶ Run sample tests" (`POST /quiz/attempt/{attempt}/run`). Master switch `config('devrank.judge0.enabled')` (env `JUDGE0_URL`), off by default; shared prop `judge0Enabled`.
- ⚠️ **New migrations**: `question_test_cases`, `quiz_answers.tests_passed/tests_total`. Verified grading via faked Judge0 (2/3 → proportional marks, graceful fallback) + browser (admin test-case editor, candidate coding question unlocked).
- Owner: set `JUDGE0_URL` (self-host judge0 or RapidAPI) to turn coding on. See CLAUDE.md "Judge0 objective code execution".

### Coding-challenge end-to-end verification (re-seed + real execution)
Verified with a **local mock Judge0** (a Node HTTP server that actually executes submissions and returns Judge0-shaped results; bound to 127.0.0.1, torn down after — a test double, NOT a sandbox). Reproduce: `node scratchpad/mock-judge0.js` (port 2358) → add `JUDGE0_URL=http://127.0.0.1:2358` to `.env` → `config:clear` → restart serve. Results (all passed):
- **Grading pipeline (real JS executed):** coding *challenge* in the active season, 3 test cases (2 sample, 1 hidden). Correct `n*2` → **3/3 tests, 20/20 marks, 100%, passed, +40 rank pts**, season standing → **rank #1 Gold, 200 pts**. Wrong `n*3` → **0/3, 0 marks**.
- **Live "Run tests"** via the real route `POST /quiz/attempt/{id}/run`: correct → `passed 2/2` (Accepted); wrong → `passed 0/2` (Wrong Answer, actual outputs 15/21 shown).
- **Unlocked in UI:** challenge quiz page showed **1 Question · 20 marks** (coding question now counted/shown); admin coding form + test-case editor render with Judge0 on.
- Full flow exercised: start attempt → run sample tests (live) → submit → grade vs hidden tests → complete → season points.
- **Cleanup after:** demo challenge + attempts removed, season score recomputed, `JUDGE0_URL` removed from `.env` (Judge0 back to **off**), mock stopped. No code changed (verification only); feature remains at commit `5ddaede`.

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

## Still pending / open (as of session #9)

**Roadmap features NOT built:** none — **all 11/11 built** (see FEATURE-STATUS.md). #11 done this session.

⚠️ **Run `php artisan migrate`** on any DB predating session #9 — new migration `hire_outcomes` and the `job_applications.status` enum now includes `hired`.

**Polish / infra — DONE (session #6):**
- ✅ **Admin Seasons UI** (`/admin/seasons`, `Admin\SeasonController`) — create/activate/close/delete; single active season; gated by `quizzes.manage`.
- ✅ **Bulk import supports coding + test cases** — `{type:"coding",language,test_cases:[…]}` alongside MCQ.
- ✅ **Reverb real-time notifications** — additive to polling, guarded/no-op until configured (`BROADCAST_CONNECTION=reverb` + `reverb:start`).
- ✅ **HMAC receipt** on `/verify` (`CredentialService::receipt`).
- ⏸ **`monaco-editor` advisory won't-fix:** 0.56.0 (latest) pulls a transitive dompurify advisory with no non-breaking fix; low impact (CDN code editor, not the forum XSS boundary). `npm audit fix` doesn't resolve it. Leave until Monaco ships a fixed dompurify.

**Owner config before go-live (not code):**
- `.env` for staging: `APP_DEBUG=false`, `APP_ENV=production`, `LOG_LEVEL=warning`, `APP_URL`, real SMTP, **HTTPS** (activates HSTS + secure cookies), `DEVRANK_GRIEVANCE_EMAIL`/`DEVRANK_ENTITY_NAME`.
- **Judge0:** set `JUDGE0_URL` (self-host or RapidAPI) to turn coding questions/challenges on. Off = MCQ-only.
- **GitHub import:** register an OAuth app, set `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` (callback `<APP_URL>/auth/github/callback`).
- **Cron:** `schedule:run` for daily `jobs:expire` + `devrank:recompute-scores` (SLA trust decay, rank-up notifications).
- **AI human-check (optional):** `DEVRANK_AI_ENABLED=true` + `ANTHROPIC_API_KEY` — NOT required; Judge0 alone grades coding.

## To pick up in a fresh session
1. `git status` clean; `php artisan migrate` on any older DB. `npm run build` if unsure. If demo data is stale: `php artisan migrate:fresh --seed`.
2. **Roadmap is complete (11/11).** Remaining work is owner go-live config only.
3. Polish DONE this session: `DemoHireSeeder` seeds ~14 verified hires (12 shared) so `/salaries` shows live bands + company profiles show real counts; company dashboard now shows a **Verified hires** stat + a **Hired** pipeline row; **all mock company-profile data replaced with real signals** — `CompanyProfile.jsx` "Avg Rating 4.8", "Feedback Rate 98%", fabricated Trust-Score Factors 1-3, the "Hires this year 14 / 18 days" sidebar, and "Founded 2016 / Remote-first" About fields are gone, replaced by real verified-hires / applicant-response-rate / open-roles / jobs-posted / member-since (`response_rate` added to `PublicProfileService`; `TrustFactor` component removed).
4. For staging: owner `.env` + HTTPS + cron + (optionally) `JUDGE0_URL`/GitHub OAuth, then deploy.
