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

## Scoring & limits
Three user scores:
- `total_rank_score` — earned activity (forum likes/replies/accepts + quiz points).
- `human_score` (candidates) — % of AI-analysed coding answers **not** flagged as AI. Computed in `ScoreService`.
- `trust_score` (companies) — 100 − ghosting rate on interview reviews (matched by `company_name`).

`ScoreService` recomputes on quiz-complete and interview events; full backfill via **`php artisan devrank:recompute-scores`**.
Points & monthly limits are config in **`config/devrank.php`** (`points.*` incl. `interview_review`, `limits.*`, `ai.*`).
Posting an interview review awards `points.interview_review` (default 15), reversed on delete (floored at 0).
Quiz ranking uses a **delta model** (retakes bank only improvement; AI-flagged answers earn 0).

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
- **Triggers** (call `app(NotificationService::class)->notify(...)`, `actorId` skips self-notify): outreach received (`InterestService::sendInterest`), interest accepted/declined (`respond`), answer accepted + new reply (`ForumService`), quiz passed (`QuizService::completeAttempt`).

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
