# DevRank — Project Guide (CLAUDE.md)

A developer ranking & hiring platform. Developers build a public track record
(forum answers, AI-proctored quizzes), companies post jobs and reach out to
talent, admins moderate. **Laravel 12 + Inertia.js + React 19**, MySQL.

## Stack & architecture
- **Backend:** Laravel 12 (PHP 8.2). Thin controllers → **fat services** in `app/Services/*`. One `*Service` per domain.
- **Frontend:** Inertia + React 19 in `resources/js/Pages/*`, layouts in `resources/js/Layouts/*`, shared bits in `resources/js/Components/*`. Vite build. `@/` alias → `resources/js`.
- **Auth/roles:** Spatie laravel-permission. Monaco editor for quiz code. Recharts for admin analytics. barryvdh/dompdf, maatwebsite/excel, yajra/datatables installed.
- **Styling:** design tokens + global classes live in `resources/css/app.css`; page CSS in `resources/css/pages/*` (imported by app.css). Dark theme.
- **Full feature/role spec:** [`docs/FUNCTIONALITY.md`](docs/FUNCTIONALITY.md) — what every role can do, reconstructed from the code.

## Running it
- Dev (all-in-one): `composer dev` (serve + queue + pail + vite). Or `php artisan serve` + `npm run dev`.
- Build assets: `npm run build` (required after JS/CSS changes to see them without the dev server).
- **DB:** MySQL at `127.0.0.1:3306`, database `devrank`, user `root`, no password (XAMPP). `.env` is git-ignored.
- Reset data: `php artisan migrate:fresh --seed` (DemoUserSeeder is slow, ~10-17s).
- Queue is `database`; mail notifications are `ShouldQueue` — run `php artisan queue:work` for real sending. Mail → Mailtrap sandbox in `.env`.

## Seeded logins (from seeders)
- Super-admin: `admin@devrank.com` / `Admin@123`
- Sub-admin: `subadmin@devrank.com` / `Admin@123`
- Demo candidates: e.g. `arjun@devrank.com` / `Demo@123`
- Demo companies: e.g. `harshit@techventures.com` / `Demo@123`

## Roles (Spatie) & access
`guest` (public) · `candidate` · `company` · `sub_admin` · `super_admin`.
Routes in `routes/web.php`; signed-in areas require **verified + active** account.
Full role→feature breakdown: the shared "DevRank — Functionality by Role" doc.
- **Quiz/challenge/question management (upload) is permission-gated**, not role-gated: the `admin/quiz` group requires **`permission:quizzes.manage`** (super_admin always; **sub_admin when granted** — it's in sub_admin's default grants). **Deleting** quizzes/questions requires **`quizzes.delete`** (super_admin only; sub_admin auto-excluded via the `%.delete%` rule). Delete buttons are hidden in the UI when the admin lacks `quizzes.delete` (`auth.user.permissions`), and the AdminLayout hides the "Quiz Mgmt" nav item without `quizzes.manage`. To revoke upload access from a specific sub_admin, remove `quizzes.manage` from that account. Candidates/companies are never allowed (403).

## Scoring & limits
Three user scores:
- `total_rank_score` — earned activity (forum likes/replies/accepts + quiz points).
- `human_score` (candidates) — % of AI-analysed coding answers **not** flagged as AI. Computed in `ScoreService`.
- `trust_score` (companies) — hiring conduct, a **weighted blend** of two signals: interview-board ghosting rate (matched by `company_name`) **and** application-response conduct (see SLA below). Only the signals a company actually has are counted, so a review-only company scores as it did before the blend.

`ScoreService` recomputes on quiz-complete, interview events, **and every application status change**; full backfill via **`php artisan devrank:recompute-scores`** (also scheduled daily to catch applications that silently cross the SLA). Points & monthly limits are config in **`config/devrank.php`** (`points.*` incl. `interview_review` + `github_verified`, `limits.*`, `ai.*`, `sla.*`, `github.*`, `privacy.*`).
Posting an interview review awards `points.interview_review` (default 15), reversed on delete (floored at 0).
Quiz ranking uses a **delta model** (retakes bank only improvement; AI-flagged answers earn 0). **GitHub import** uses the same delta model (reconnecting refreshes stats without re-awarding).

## Response SLA / "zero ghosting" enforcement (#10)
- **Mandatory rejection reasons:** rejecting a job applicant requires a reason (≥10 chars), enforced **server-side** (`JobController::updateApplicationStatus` `required_if:status,rejected`) *and* in the Applicants UI (confirm disabled until valid). No silent closes.
- **Response SLA feeds trust_score:** `job_applications.responded_at` is stamped on the first move off `applied` (stops the SLA clock). Applications left un-responded past **`config('devrank.sla.response_days')`** (default 14) count as breaches; `trust_score = 100 − weighted(ghost_rate, sla_breach_rate)` (`sla.ghost_weight`/`sla.response_weight`). `ScoreService::updateTrustScoreForUser` / `applicationBreachRate`.
- Applicants view flags **overdue/awaiting** applicants + shows an SLA banner. `getJobApplicants` returns `awaiting_response` / `sla_overdue` per row.

## Security & DPDP compliance
- **Security headers:** `app/Http/Middleware/SecurityHeaders.php` on the web group (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Permitted-Cross-Domain-Policies, HSTS on https). ⚠️ CSP intentionally **not** enforced (Vite/Inertia inline assets need nonces).
- **Rate limiting:** `throttle` on login (5/min), register (10/min), password-reset (5 & 6/min), data-export (4/min).
- **DPDP (Digital Personal Data Protection Act, 2023) — implemented:** consent capture at registration (mandatory checkbox → `users.consented_at`); public `/privacy` + `/terms` pages (`LegalController`); **data export** `GET /account/data-export` (full JSON); **erasure** `DELETE /account` (password-confirmed → PII scrubbed, email released, soft-delete, authored content anonymised) via `AccountService`; self-service hub `/account/settings` (`Settings/Account.jsx`); grievance contact in `config('devrank.privacy.*')`. Full audit: [`docs/SECURITY_DPDP.md`](docs/SECURITY_DPDP.md).
- **The personal-data surface lives in `AccountService`** — when adding a personal field, update export + erasure there.

## GitHub import — verified rank signal (#6)
- **Laravel Socialite** GitHub OAuth **connect** flow (account link for logged-in candidates, NOT a login provider): `GithubController@redirect|callback`, routes `/auth/github/{redirect,callback}` (candidate-only). `GithubImportService::linkAndImport` verifies identity (`users.github_id` unique — one GitHub per account), imports public repos/followers/stars/top-language (forks excluded, public API), and banks **capped** rank points (`config('devrank.github.points')` + `points.github_verified`) via the **delta model**.
- **Master switch `config('devrank.github.enabled')`** = true only when `GITHUB_CLIENT_ID` is set → the "Connect GitHub" UI/routes stay hidden (404) with no OAuth app (mirrors `aiEnabled`). Exposed to React as shared prop **`githubEnabled`**. Candidate dashboard shows a connect card → verified badge.
- Owner setup: register an OAuth app at github.com/settings/developers, callback `<APP_URL>/auth/github/callback`, set `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`.

## Verifiable rank credentials (#2) — BUILT
- **Signed embeddable badge + public audit page.** `CredentialService` mints a public, revocable token per candidate (`credential_tokens`). Public routes: **`GET /badge/{token}.svg`** (hand-built shields-style SVG, rendered live from the DB each request — forged query params ignored; `metric=rank|tag:{slug}|human`) and **`GET /verify/{token}`** (`Verify/Credential.jsx` audit page — rank/score/percentile/skill-rankings/how-earned, already-public data only). Candidate dashboard has a **"Your verified rank badge"** card (live preview + copy Markdown/HTML/Link + rotate/revoke); token minted opt-in. `human` metric **404s while `config('devrank.ai.enabled')` is off** (never leaks a hidden readout). Secret: `config('devrank.credentials.secret')` (falls back to `APP_KEY`). Design notes: [`docs/CREDENTIALS_SCOPE.md`](docs/CREDENTIALS_SCOPE.md).

## Smart matching (#4), skill paths (#9), seasons/challenges (#8) — BUILT
- **Matching (`MatchService`):** 0–100 score = skill overlap (candidate forum tags ∩ job tags, 50%) + rank (25%) + experience fit (15%) + preference fit (10%). Candidate dashboard "Top job matches" + **open-to-work toggle** (`MatchController::toggleAvailability`); company **Browse Talent** (`/company/talent`) ranks `open_to_work` candidates by match to a chosen job. **Saved searches + job alerts:** candidates save job-board filters (`saved_searches`), and `JobService::fireJobAlerts` notifies them (`job_alert`) when a matching job is posted (`SavedSearch::matchesJob`).
- **Skill paths (`SkillPathService`, `/skill-paths`):** per-skill "climb" (engaged, room to improve) vs "new" paths recommending unattempted published quizzes in that tag + open forum questions to answer. Built from existing content — no authored curriculum.
- **Seasons / leagues / weekly challenges (`SeasonService`, public `/challenges`):** `seasons` + `season_scores`; a **weekly challenge is a Quiz** with `is_challenge` + `season_id` + `challenge_starts_at/ends_at`. **Season points = sum of a candidate's BEST percentage per season challenge** (idempotent on retakes); leagues **Gold (top 10%) / Silver (35%) / Bronze** by season rank. Awarded in `QuizService::completeAttempt`. `SeasonSeeder` creates a current season + 2 live challenges.
- **How challenge/test questions are uploaded:** a challenge is just a quiz, so questions go through the **existing admin quiz builder** (`Admin/Quiz/Questions.jsx` → `storeQuestion`, one at a time) **plus a bulk JSON import** — `POST /admin/quiz/{quiz}/questions/bulk` (`storeQuestionsBulk`, paste-JSON panel): an array of `{body, marks?, explanation?, options:[{option_text,is_correct}]}` MCQs (exactly one correct each). Flag the quiz as a challenge + set its window in the quiz create/edit form (auto-joins the current season). Coding questions still need AI grading (blocked when AI off).

## Conventions & gotchas (learned the hard way)
- **`auth.user.roles` is an array of STRINGS** (`getRoleNames()`). In React use `roles.includes('candidate')` — **never** `roles.some(r => r.name === …)` (silently always false).
- **`.container`** is a global centered 1200px wrapper (defined in `app.css`), NOT bare Tailwind. Footer (`.home-footer`) is full-bleed by design.
- Base **`.btn` / `.btn-*`** button classes live in `app.css` (they were missing before; don't re-inline them per page).
- Fonts (**Geist**, Geist Mono, Instrument Serif) are loaded via Google Fonts `<link>` in `resources/views/app.blade.php`.
- **`ProfileViewLog`** columns are `company_id` / `candidate_id` / `view_type` (not viewer_id/profile_id).
- **Candidate contact details are gated.** On the public profile, `email`, `resume_url`, `github_url`, `linkedin_url` are only exposed to: the candidate themselves, an admin, or a **company whose interest that candidate has ACCEPTED**. Enforced **server-side** in `PublicProfileService::getCandidateProfile` (`canViewContact` nulls the fields — the data never reaches an unauthorised client; don't rely on the frontend). The page reads the `contact_unlocked` flag to show a "🔒 private / send interest to unlock" state. The rest of the profile (name, headline, rank, skills, answers) stays public. Applicants who **applied** to a company's job still show their résumé in the applicant view (they consented by applying) — that path is intentionally not gated.
- **Forum posts & replies are rich HTML** (TipTap editor, `resources/js/Components/RichTextEditor.jsx`, React.lazy-loaded so it stays out of the main bundle). **`HtmlSanitizer` (HTMLPurifier) is the single XSS trust boundary** — every body is sanitized server-side on save in `ForumService` (never trust the client). Bodies render via `dangerouslySetInnerHTML` with `.rich-content` styling. Inline images upload to `POST /forum/upload-image` → `storage/app/public/forum-images` (public disk). Body length is validated on **stripped-text** length, not raw HTML.
- **composer** here needs `--ignore-platform-reqs` for new packages (the lock pins symfony v8 which wants PHP 8.4, but runtime is 8.2 — pre-existing).
- **AI scoring** (`AiScoringService`) needs `ANTHROPIC_API_KEY`. **Master switch: `config('devrank.ai.enabled')` (`DEVRANK_AI_ENABLED`, default `false`).** When **off (phase-1 launch, no key, no cost):** quizzes run **MCQ-only** (coding questions are filtered out of `getQuizForAttempt` and the completion denominator, and `gradeCoding` short-circuits so **zero API calls** are made), the admin quiz builder blocks coding questions, and the **`human_score` "% Human" UI is hidden** (leaderboard column, candidate dashboard card → shows Profile Views instead, public profile readouts). The flag is exposed to React as the shared Inertia prop **`aiEnabled`**. When **on:** model id / threshold / blend weights / `flag_on_api_failure` are all `config('devrank.ai.*')`; on API failure the flag decision falls back to the paste/typing heuristic (paste-cheating still caught), quality degrades to manual-review — no crash.
- Config keys for limits are `config('devrank.limits.monthly_applications|monthly_job_posts|monthly_outreach', …)`.

## Frontend motion & interaction layer
A small, reusable, **reduced-motion-safe** system powers all page animation — don't hand-roll per-page effects, use these:
- **CSS:** `resources/css/animations.css` (imported last in `app.css`). Keyframes + utility classes.
- **Engine:** `resources/js/lib/reveal.js` — an IntersectionObserver, armed globally in `app.jsx` and re-run on every Inertia `finish`. Adds `.js-reveal` to `<html>`; a 1.5s safety-net reveals anything still hidden, so **content is never stranded invisible** (no-JS = fully visible).
- **`CountUp`** component (`resources/js/Components/CountUp.jsx`) — viewport-triggered number roll; use for real numeric stats only.
- **Conventions (attributes/classes):**
  - `data-reveal` on a section/card → fade+slide in on scroll/load. Variants: `="fade"`, `="scale"`, `="left"`, `="right"`, `="none"` (state-only, for bars).
  - `data-reveal-stagger="80"` on a **parent** → its direct `[data-reveal]` children get an incremental delay (value = ms step).
  - `bar-grow` + `data-reveal="none"` + `style={{'--bar-w': pct}}` → a meter that grows 0→target when revealed. Convert any inline-width fill this way.
  - Hover/press: `hover-lift` (cards), `hover-raise` (small), `pop-on-active` (buttons), `link-underline`, `hover-sheen`. Ambient: `dr-live-dot`, `dr-float`, `dr-skeleton`.
- ⚠️ Numbers "counting" (e.g. a stat briefly showing a low value) or a dim first frame in a screenshot are **CountUp / reveal mid-animation, not bugs**. Verify final values in the DB/tinker, not a mid-flight screenshot.

## Company applicant view & admin categories (added this pass)
- **Company sees applicants per job:** `GET /company/jobs/{job}/applicants` (`Company\JobController@applicants`) → `Company/Jobs/Applicants.jsx`; status moves via `PUT /company/applications/{application}/status`. Backed by `JobService::getJobApplicants/getRecentApplicants/updateApplicationStatus`. Owner-scoped.
- **Company & Admin dashboards read real data** now — `DashboardService::getCompanyStats` returns real pipeline/trust/outreach/recent-applicants (the old page was hardcoded mock).
- **Admin forum-category CRUD:** `/admin/categories` (`AdminController@categories|storeCategory|updateCategory|destroyCategory|toggleCategory` → `AdminService`), page `Admin/Categories.jsx`. Delete is **blocked while a category has topics** (topics require a category).

## In-app notifications (engagement)
- Purpose-built (NOT Laravel's `Notifiable` DB channel): table **`user_notifications`**, model `UserNotification`, `NotificationService`, `NotificationController`, page `Notifications/Index.jsx`, and a nav bell **`Components/NotificationBell.jsx`** (in `MainLayout`, so candidates + companies; admins on `AdminLayout` don't get it yet).
- **Near-real-time via polling** — the bell fetches `GET /notifications/feed` every 45s (visible tab only) + after each Inertia navigation. No websocket infra (Reverb/Echo can be added later without changing the data model).
- Routes: `GET /notifications`, `GET /notifications/feed` (JSON), `POST /notifications/read-all`, `POST /notifications/{notification}/read`. Fetch POSTs send the `X-XSRF-TOKEN` cookie header.
- **Triggers** (call `app(NotificationService::class)->notify(...)`, `actorId` skips self-notify): outreach received (`InterestService::sendInterest`), interest accepted/declined (`respond`), answer accepted + new reply (`ForumService`), quiz passed (`QuizService::completeAttempt`), **rank-up** (`ScoreService::notifyRankChanges` — daily via `recompute-scores`, compares `users.last_rank_position`, silent on baseline), **admin moderation** (`NotificationService::notifyAdmins` → all super+sub admins, fired when an interview review auto-hides at the report threshold). Admins inherit the bell because **`AdminLayout` wraps `MainLayout`**.

## Testing approach (no Chrome extension yet)
- **Routes:** curl audit — log in per role (CSRF via `XSRF-TOKEN` cookie → `X-XSRF-TOKEN` header), GET every page, expect 200.
- **Write flows:** call the service/controller logic directly in `php artisan tinker` inside a `DB::beginTransaction()` … `DB::rollBack()` so nothing persists. This is how the real bugs were caught.
- ⚠️ **When filtering tinker/artisan output in bash, do NOT `grep -v warning`** — MySQL data-truncation errors start with "Warning:" and get hidden. Filter only the harmless `Module "openssl" is already loaded` line.
- Deeper UI click-through: the in-app **Browser pane** works (login-per-role, click, screenshot, console/JS checks) — used this pass to verify the motion layer, applicant view, and category CRUD end-to-end. Curl route-audit trick: `GET /account` to seed the `XSRF-TOKEN` cookie, url-decode it (`sed 's/%3D/=/g;s/%2F/\//g;s/%2B/+/g'`) into an `X-XSRF-TOKEN` header on the login POST, then reuse the cookie jar.

## Git
- Work on `main` (solo repo; owner pushes directly). Remote: `github.com/samar3088/devrank`.
- **Push fix:** this repo has `http.sslBackend=schannel` set locally to get past an SSL "unable to get local issuer certificate" error behind a TLS-intercepting proxy. If pushes fail with that error again, re-apply: `git config http.sslBackend schannel`.
- End commit messages with:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

See **handoff.md** for current session state and what's pending.
