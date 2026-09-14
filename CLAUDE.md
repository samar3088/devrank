# DevRank — Project Guide (CLAUDE.md)

A developer ranking & hiring platform. Developers build a public track record
(forum answers, AI-proctored quizzes), companies post jobs and reach out to
talent, admins moderate. **Laravel 12 + Inertia.js + React 19**, MySQL.

## Stack & architecture
- **Backend:** Laravel 12 (PHP 8.2). Thin controllers → **fat services** in `app/Services/*`. One `*Service` per domain.
- **Frontend:** Inertia + React 19 in `resources/js/Pages/*`, layouts in `resources/js/Layouts/*`, shared bits in `resources/js/Components/*`. Vite build. `@/` alias → `resources/js`.
- **Auth/roles:** Spatie laravel-permission. Monaco editor for quiz code. Recharts for admin analytics. barryvdh/dompdf, maatwebsite/excel, yajra/datatables installed.
- **Styling:** design tokens + global classes live in `resources/css/app.css`; page CSS in `resources/css/pages/*` (imported by app.css). Dark theme.

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
Points & monthly limits are config in **`config/devrank.php`** (`points.*`, `limits.*`).
Quiz ranking uses a **delta model** (retakes bank only improvement; AI-flagged answers earn 0).

## Conventions & gotchas (learned the hard way)
- **`auth.user.roles` is an array of STRINGS** (`getRoleNames()`). In React use `roles.includes('candidate')` — **never** `roles.some(r => r.name === …)` (silently always false).
- **`.container`** is a global centered 1200px wrapper (defined in `app.css`), NOT bare Tailwind. Footer (`.home-footer`) is full-bleed by design.
- Base **`.btn` / `.btn-*`** button classes live in `app.css` (they were missing before; don't re-inline them per page).
- Fonts (**Geist**, Geist Mono, Instrument Serif) are loaded via Google Fonts `<link>` in `resources/views/app.blade.php`.
- **`ProfileViewLog`** columns are `company_id` / `candidate_id` / `view_type` (not viewer_id/profile_id).
- **AI scoring** (`AiScoringService`) needs `ANTHROPIC_API_KEY` in `.env` (currently a placeholder). On missing/failed key it falls back to a neutral 5.0 score and logs a warning — grading degrades, no crash. Model id is hardcoded.
- Config keys for limits are `config('devrank.limits.monthly_applications|monthly_job_posts|monthly_outreach', …)`.

## Testing approach (no Chrome extension yet)
- **Routes:** curl audit — log in per role (CSRF via `XSRF-TOKEN` cookie → `X-XSRF-TOKEN` header), GET every page, expect 200.
- **Write flows:** call the service/controller logic directly in `php artisan tinker` inside a `DB::beginTransaction()` … `DB::rollBack()` so nothing persists. This is how the real bugs were caught.
- ⚠️ **When filtering tinker/artisan output in bash, do NOT `grep -v warning`** — MySQL data-truncation errors start with "Warning:" and get hidden. Filter only the harmless `Module "openssl" is already loaded` line.
- Deeper UI click-through needs the **Claude for Chrome** extension connected (not available in these sessions so far).

## Git
- Work on `main` (solo repo; owner pushes directly). Remote: `github.com/samar3088/devrank`.
- **Push fix:** this repo has `http.sslBackend=schannel` set locally to get past an SSL "unable to get local issuer certificate" error behind a TLS-intercepting proxy. If pushes fail with that error again, re-apply: `git config http.sslBackend schannel`.
- End commit messages with:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

See **handoff.md** for current session state and what's pending.
