# DevRank — Session Handoff

_Last updated: 2026-10-25 (session #17). Read `CLAUDE.md` for durable project context; `docs/FUNCTIONALITY.md` for the full feature/role spec; `docs/DEPLOYMENT.md` for the deploy runbook. This file stays lean — only current state, recent sessions, and open work._

## Current state
- Branch **`main`**. **Live:** `https://www.samatasrivastva.com` (cPanel shared host; seeded DB, Mailtrap, no-index on) on **PHP 8.3.36 · Laravel 12.70.1 · symfony 7.4** (CVEs patched, `composer audit` clean). Roadmap **11/11 complete** + hardening.
- **Deploy = delta workflow:** `C:\Users\samsr\devrank-deploy\sync.ps1` → writes `changes\` → owner uploads its contents (overlay) → on server re-cache (`config:clear && config:cache && route:cache && view:cache`; `migrate --force` if a migration shipped) → advance baseline (`git rev-parse HEAD > .last-deploy`). "**do regular work**" = commit + update CLAUDE.md/handoff.md + run sync.ps1 (don't upload/advance — owner does).
- ⚠️ **The prod host CANNOT reach GitHub** (`api.github.com` DNS fails; git falls back to SSH). **Never run `composer install` on the server.** When deps change, build `vendor/` locally (`composer install --no-dev --optimize-autoloader`) → tar.gz → owner uploads + extracts. Code/asset-only deploys don't touch `vendor/`.
- **Deploy baseline:** `.last-deploy` = `229a3f2` — **everything through session #17 (incl. PHP 8.3) is uploaded & live.**
- **Full verification (2026-10-25, post-8.3):** all routes (guest + candidate + company + admin + detail + filter routes) = 200/302, zero errors; write-flow smoke tests green (forum reply/like/accept + HTML sanitize, leaderboard/forum multi-filters, job apply + `shared_contact` consent gate, hire record→confirm, interest→ProfileViewLog, score, DPDP). 
- ⚠️ **Demo jobs are time-anchored** → they expire 30 days after posting (`config('devrank.jobs.expiry_days')=30`, kept as-is; daily `jobs:expire` cron), so the seeded board **empties over time**. One-time refresh (reactivate ~20 recent with staggered 3–30d expiry) done locally + SQL handed to owner for prod. Repopulates on re-seed; self-solves once real jobs are posted. A scheduled "demo-refresh" command is an option if needed.

## Recent sessions (newest first)
- **#17** (PHP 8.3 + deps/security) — **DEPLOYED & LIVE**: runtime upgraded to **PHP 8.3.36**. `composer.json` → `php ^8.3` + `config.platform.php` pin; `composer update` re-resolved **symfony v8→v7.4** (8.3-compatible) so **`--ignore-platform-reqs` is no longer needed**. **Laravel → 12.70.1** (covers CVE-2026-114509/114508 fixed 12.68.0, CVE-2026-102279 fixed 12.69.0); `composer audit` = clean. Full route audit (all roles, all GET routes + detail pages) = **200/302, zero errors/deprecations**. No app code changes needed for 8.3. DPDP intact. Added `*.sql` to `.gitignore`. ⚠️ The only failing phpunit is the stock `ExampleTest` (404 in `testing` env only; live `/`=200) — pre-existing scaffolding gap. **Deployed via vendor-upload** (host can't reach GitHub — see Current state): switched cPanel PHP→8.3, uploaded `composer.json`/`.lock` + a locally-built `vendor/` tar.gz, re-cached. Server keeps `vendor.bak`/`composer.lock.bak` for rollback.
- **#16** (UX): **Apply #4 done** — share buttons on job detail + forum topic now copy the link and show a **"Link copied" toast** (`copyToClipboard` helper in `lib/dialog.jsx` with `execCommand` fallback; 📧 button → mailto). Docs compacted for lower token use.
- **#15**: Forum filter → searchable **multi-select dropdown** (`latest|pinned|hot|unanswered|solved`, OR + latest-sort; `getTopics` takes `filters[]`; Reset→**Clear**). **Job apply**: optional résumé upload + per-application info-sharing consent (`job_applications.shared_fields` JSON — **migration**; company sees only server-gated `shared_contact`). Job display tags `tag-static` (no hand cursor). `RichTextEditor` clears on `form.reset()`.
- **#14**: Lazy-loaded all Inertia pages (main bundle 383 KB→10 KB). Leaderboard skills → multi-select dropdown. Forum category counts/order fixed. Job-board "Clear all" keeps search + separate Clear for search.
- **#13**: Removed dead leaderboard View button. Forum clickable tags, working latest/solved filters, category id-or-slug fix, `is_solved` badge. Fixed **back-button→blank** (popstate reveal re-arm). All native `confirm`/`prompt` → portal-styled dialogs. Email-content docx created.
- **#12**: Data-loading perf pass — 7 N+1/per-row-count hotspots collapsed to grouped queries (no new indexes needed; schema already covers hot filters).
- **#2–#11**: built the 11/11 roadmap + security/DPDP/perf hardening + live deploy. Details in CLAUDE.md and git history.

## Roadmap / backlog status
**✅ Done (owner checklist, shipped & live):** all Leaderboard items (View removed, Search+Clear) · Forum (clickable tags, latest/solved/pinned filters, multi-select dropdown, back-button-blank fix, portal-styled delete, Reset→Clear, reply clears) · Apply Job #1 résumé+info-sharing, #2 tag cursor, #4 share-copy "Link copied" · PHP 8.3 + Laravel 12.70.1 security upgrade.

**⏳ Pending / parked:**
- ⏸ **Save Jobs — ON HOLD (scoped).** The "🔖 Save Job" button is a dead stub (no handler/route/storage). Plan: `saved_jobs` table (`user_id`,`jobs_listing_id`, unique pair) + model; candidate-only toggle route (`POST/DELETE /jobs/{job}/save`); wire the button on `JobBoard/Show` + job cards to toggle filled/outline state; a **"My Saved Jobs"** page (candidate nav/dashboard); DPDP erasure cascades on user delete. Est ~0.5 day.
- ◻ **Forum up/down voting** — only a Like (upvote, +points) + Accept exist today; no down-vote. Pending if owner wants StackOverflow-style up/down.
- ◻ **Email job alerts** — "Save & alert me" saves filters + fires an **in-app** notification (`JobService::fireJobAlerts`); owner also wants an **email** trigger (+ maybe explicit company/tech picker). Pending (prod mail is Mailtrap sandbox).
- ❓ **Forum #1** ("category selected but no tags → no filters") — the category id-vs-slug filter bug is fixed; confirm with owner whether this is what they meant.

## Owner config (not code) before public launch
- Real SMTP (swap `MAIL_*`); `APP_INDEXABLE=true` + open `robots.txt` to go public; real footer social URLs (`SocialLinks`); rotate/remove demo seed accounts (shared passwords).
- Optional: `JUDGE0_URL` (unlocks coding), `DEVRANK_AI_ENABLED=true`+`ANTHROPIC_API_KEY` (AI human-check). GitHub OAuth already configured on prod.

## Picking up fresh
- `php artisan migrate` on any older DB; `npm run build` after JS/CSS; `php artisan migrate:fresh --seed` if demo data is stale. Local-only `devrank-deploy\docs\` holds the credentials + features + monetization + email Word docs (never uploaded).
