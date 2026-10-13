# DevRank — Session Handoff

_Last updated: 2026-10-14 (session #16). Read `CLAUDE.md` for durable project context; `docs/FUNCTIONALITY.md` for the full feature/role spec; `docs/DEPLOYMENT.md` for the deploy runbook. This file stays lean — only current state, recent sessions, and open work._

## Current state
- Branch **`main`**. **Live:** `https://www.samatasrivastva.com` (cPanel shared host; seeded DB, Mailtrap, no-index on). Roadmap **11/11 complete** + hardening.
- **Deploy = delta workflow:** `C:\Users\samsr\devrank-deploy\sync.ps1` → writes `changes\` → owner uploads its contents (overlay) → on server re-cache (`config:clear && config:cache && route:cache && view:cache`; `migrate --force` if a migration shipped) → advance baseline (`git rev-parse HEAD > .last-deploy`). "**do regular work**" = commit + update CLAUDE.md/handoff.md + run sync.ps1 (don't upload/advance — owner does).
- **Deploy baseline:** `.last-deploy` = `69fcfe4` (sessions #12–15 uploaded & live). **Session #16 is in the working tree, NOT yet committed** — commit + `sync.ps1` on the next "do regular work".

## Recent sessions (newest first)
- **#16** (UX): **Apply #4 done** — share buttons on job detail + forum topic now copy the link and show a **"Link copied" toast** (`copyToClipboard` helper in `lib/dialog.jsx` with `execCommand` fallback; 📧 button → mailto). Docs compacted for lower token use.
- **#15**: Forum filter → searchable **multi-select dropdown** (`latest|pinned|hot|unanswered|solved`, OR + latest-sort; `getTopics` takes `filters[]`; Reset→**Clear**). **Job apply**: optional résumé upload + per-application info-sharing consent (`job_applications.shared_fields` JSON — **migration**; company sees only server-gated `shared_contact`). Job display tags `tag-static` (no hand cursor). `RichTextEditor` clears on `form.reset()`.
- **#14**: Lazy-loaded all Inertia pages (main bundle 383 KB→10 KB). Leaderboard skills → multi-select dropdown. Forum category counts/order fixed. Job-board "Clear all" keeps search + separate Clear for search.
- **#13**: Removed dead leaderboard View button. Forum clickable tags, working latest/solved filters, category id-or-slug fix, `is_solved` badge. Fixed **back-button→blank** (popstate reveal re-arm). All native `confirm`/`prompt` → portal-styled dialogs. Email-content docx created.
- **#12**: Data-loading perf pass — 7 N+1/per-row-count hotspots collapsed to grouped queries (no new indexes needed; schema already covers hot filters).
- **#2–#11**: built the 11/11 roadmap + security/DPDP/perf hardening + live deploy. Details in CLAUDE.md and git history.

## Open UI backlog (from owner's checklist)
- ⏸ **Save Jobs — ON HOLD (scoped).** The "🔖 Save Job" button is a dead stub (no handler/route/storage). Plan: `saved_jobs` table (`user_id`,`jobs_listing_id`, unique pair) + model; candidate-only toggle route (`POST/DELETE /jobs/{job}/save`); wire the button on `JobBoard/Show` + job cards to toggle filled/outline state; a **"My Saved Jobs"** page (candidate nav/dashboard); DPDP erasure cascades on user delete. Est ~0.5 day.
- ◻ **Forum up/down voting** — only a Like (upvote, +points) + Accept exist today; no down-vote. Pending if owner wants StackOverflow-style up/down.
- ◻ **Email job alerts** — "Save & alert me" saves filters + fires an **in-app** notification (`JobService::fireJobAlerts`); owner also wants an **email** trigger (+ maybe explicit company/tech picker). Pending (note: prod mail is Mailtrap sandbox).
- ❓ **Forum #1** ("category selected but no tags → no filters") — the category id-vs-slug filter bug is fixed; confirm with owner whether this is what they meant.

## Owner config (not code) before public launch
- Real SMTP (swap `MAIL_*`); `APP_INDEXABLE=true` + open `robots.txt` to go public; real footer social URLs (`SocialLinks`); rotate/remove demo seed accounts (shared passwords).
- Optional: `JUDGE0_URL` (unlocks coding), `DEVRANK_AI_ENABLED=true`+`ANTHROPIC_API_KEY` (AI human-check). GitHub OAuth already configured on prod.

## Picking up fresh
- `php artisan migrate` on any older DB; `npm run build` after JS/CSS; `php artisan migrate:fresh --seed` if demo data is stale. Local-only `devrank-deploy\docs\` holds the credentials + features + monetization + email Word docs (never uploaded).
