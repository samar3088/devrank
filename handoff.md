# DevRank — Session Handoff

_Last updated: 2026-09-14. Read `CLAUDE.md` first for durable project context._

## Where things are
- Branch **`main`**, clean working tree, everything pushed to `origin/main`.
- Latest commit: **`8360e84`** — job status enum fix + tag-ranking N+1 + demo score variation.
- The last several sessions were a **pre-staging hardening pass**. Goal: get the app ready for a staging deploy.

## Pre-staging checklist status
| # | Task | Status |
|---|------|--------|
| 1 | Test whole app for broken functionality | ✅ Done — routes (all 200 per role) + all write flows (service-layer). Bugs found & fixed (below). |
| 2 | Pending code / AI key | ⏳ **Owner action** — set `ANTHROPIC_API_KEY` + staging `.env` (see below). Not code. |
| 3 | Remove unused code | ✅ Done — approved batch. |
| 4 | Faster (indexing + query optimization, NO cache) | ✅ Done — indexes + N+1 cuts + tag-ranking rewrite. |
| 5 | Test email | ✅ Done — renders + sends via Mailtrap + queue, 0 failures. |
| 6 | List functionality by user role | ✅ Done — shareable doc (Artifact). |
| + | Demo score variation for staging | ✅ Done — `DemoScoreVariationSeeder` (in `DatabaseSeeder`). |

## Bugs found & fixed this pass (all committed)
- Broken routes/role checks, ProfileViewLog schema mismatch, clobbered Forum index, forum restored (`ea4c237`).
- Route collision on `/company/{id}` capturing `/company/jobs|profile|interests` (numeric `whereNumber` constraint); candidate-profile 500 (`resume_url` → `resume_path`); all demo jobs expired (relative dates); `QuizSeeder` not registered (`b34ab87`).
- Admin **Edit Quiz** rendered a non-existent page → now reuses `Admin/Quiz/Create` (`1ad0dfd`).
- Missing base `.btn` classes, fonts not loaded, footer not full-width, dim `--text3` (`1ad0dfd`).
- **Job status enum** missing `paused` → pausing/closing a job threw "Data truncated"; enum extended (`8360e84`).

## Features implemented this pass
- **human_score & trust_score** — were declared but never written; now computed by `ScoreService`, recomputed on events, backfilled via `php artisan devrank:recompute-scores`.
- **Forum points** — reply `+5`, accepted answer `+50` (reversed on un-accept/delete), guarded against negative scores.
- **Interview report flow** — `POST /interviews/{review}/report`; auto-hides a review at 5 reports.
- Interview board redesign, quiz page header, global fonts/buttons/container/footer polish.
- Indexes: `replies(user_id,status,likes_count)`, `quiz_attempts(status,completed_at)`, `interview_reviews(status,created_at)`. N+1 cuts in candidate/company dashboards + `TagRankingService`.

## ⏳ Pending — owner action before staging (task #2)
Set in the staging `.env` (local `.env` is git-ignored, untouched):
- `ANTHROPIC_API_KEY=` real key (else coding-quiz grading falls back to neutral 5.0).
- `APP_URL=` the staging domain (email verify/reset links use it).
- `APP_DEBUG=false`
- Real SMTP (`MAIL_*`) if staging should send real email (currently Mailtrap sandbox).
- Consider `LOG_LEVEL=warning`.

## Optional / open offers (not blockers)
- **Browser click-through QA of #1** — real-user click testing (quiz submit, forum reply, apply, etc.) + JS console checks. Needs the **Claude for Chrome** extension connected (research-preview, gated) and the AI key for the quiz path.
- Medium-priority perf left: AdminService analytics runs 5 YEARWEEK queries; `getCandidateStats` untaken-quiz subquery could be `whereNotExists`.
- `AiScoringService`: model id + AI-flag threshold are hardcoded (could move to config). Fallback returns 5.0 (a suspect answer passes if the API is down) — consider flagging for manual review instead.

## To pick up in a fresh session
1. `git pull`, confirm on `main` at `8360e84` (or later).
2. `php artisan migrate --force` then `php artisan db:seed` (or `migrate:fresh --seed`) — the demo seeders create realistic data incl. score variation.
3. If a push fails with an SSL cert error: `git config http.sslBackend schannel` (see CLAUDE.md).
4. For staging: do task #2 (`.env` + API key), then deploy.
