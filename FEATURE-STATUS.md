# DevRank — Feature Status

_Last verified: 2026-09-18. Legend: ✅ done & verified · 🟡 partial / scoped · ❌ not started._
_Recent: built #1 Judge0 code execution (unlocks coding challenges), #4 matching, #8 seasons/leagues/weekly-challenges, #9 skill paths, #2 credentials; sub_admin quiz-upload permission; rank-up + admin-moderation notifications._
_Verification method: route audit (all roles → 200), rolled-back write-flow tests in tinker, security/DPDP HTTP checks, physical index inspection. See `docs/SECURITY_DPDP.md` and `CLAUDE.md`._

## Core platform modules

| Module | Status | Notes / verification |
|---|---|---|
| **Auth — register** | ✅ | Strong password policy; **DPDP consent** mandatory; role-specific fields. `throttle:10,1`. |
| **Auth — login / logout** | ✅ | `throttle:5,1` (verified 429 on 6th); deactivated-account block. |
| **Email verification** | ✅ | Signed routes; resend throttled. Signed-in areas require verified + active. |
| **Password reset** | ✅ | Throttled (5/6 per min); custom mail notification. |
| **Forum** | ✅ | Topic/reply/like/accept verified (+5 / +10 / +50, reversible). **XSS stripped** server-side (HTMLPurifier). Rich-text (TipTap), image upload. |
| **Quiz** | ✅ | MCQ flow verified end-to-end (start → answer → complete → points). Phase-1 **MCQ-only** (AI off, zero API calls). Delta ranking. |
| **Jobs — post/edit** | ✅ | Owner-scoped; monthly post limit; tags. |
| **Jobs — apply** | ✅ | Monthly counter, duplicate-apply guard verified. |
| **Applicant pipeline (#10)** | ✅ | Status moves, **mandatory rejection reason**, SLA `responded_at`, overdue/awaiting flags. Owner-scoped. |
| **Interests / outreach** | ✅ | Send (limit + notification), accept → ProfileViewLog + notification, verified. |
| **Interview board** | ✅ | Create (+15, trust recompute), delete (−15 reversed), report/auto-hide. |
| **Leaderboard** | ✅ | Eager-loaded (2 queries); covering index. |
| **Public profiles** | ✅ | **Contact gate** verified: guest/other-company nulled; self/admin/accepted-company unlocked. |
| **Admin** | ✅ | Users/companies toggle, jobs, moderation, tags, **category CRUD** (delete-guard verified), analytics, quiz builder. All routes 200 for super + sub admin. |
| **In-app notifications** | ✅ | `user_notifications`, polling bell (45s). Triggers: outreach, interest response, answer accepted, new reply, quiz passed, **rank-up** (daily), **admin moderation**. Admins inherit the bell (AdminLayout→MainLayout). |
| **Scoring** | ✅ | `total_rank_score`, `human_score`, `trust_score` (blended); `devrank:recompute-scores` persists (verified after bug-fix). |

## Roadmap items

### Differentiators
| # | Item | Status |
|---|---|---|
| 1 | Objective code-execution grading (Judge0) | ✅ **Built** — Judge0Service runs coding submissions against hidden test cases for a provable correctness score; unlocks coding questions/challenges without AI. Off until `JUDGE0_URL` set. |
| 2 | Verifiable embeddable rank credentials | ✅ **Built** — signed `/badge/{token}.svg` + public `/verify/{token}` audit page + dashboard share card (mint/rotate/revoke). Live-rendered, forgery-proof, human-metric gated. |
| 3 | Bias-reduced hiring flow | 🟡 **Partial** — contact-privacy gate live; name/photo/location anonymization in discovery not built. |

### High-impact
| # | Item | Status |
|---|---|---|
| 4 | Smart two-sided matching | ✅ **Built** — MatchService (skill×rank×experience×prefs), candidate "top matches" + open-to-work toggle, company "Browse Talent", saved searches + job alerts. |
| 5 | AI mock-interview from interview-board data | ❌ Not started. |
| 6 | **GitHub import** | ✅ **Built** — Socialite OAuth connect, verified repos/stars/language signal, capped delta-model points. Off until `GITHUB_CLIENT_ID` set. (Stack Overflow deferred per decision.) |

### Engagement
| # | Item | Status |
|---|---|---|
| 7 | Real-time in-app notifications | ✅ Built (polling; Reverb/WebSocket optional later). |
| 8 | Seasons / leagues / weekly challenges | ✅ **Built** — seasons + season_scores, weekly-challenge quizzes (timed, season-linked), Gold/Silver/Bronze leagues, public /challenges page, admin bulk question import. |
| 9 | Skill paths | ✅ **Built** — per-skill "climb / new" paths recommending unattempted quizzes + open questions (/skill-paths). |

### Company-side trust
| # | Item | Status |
|---|---|---|
| 10 | **Enforced response SLAs** | ✅ **Built** — mandatory rejection reasons + trust-score penalty for un-responded applications past SLA. |
| 11 | Verified hire outcomes + salary transparency | ❌ Not started. |

## Security & DPDP
| Area | Status |
|---|---|
| Security headers (nosniff, frame, referrer, permissions, HSTS) | ✅ |
| Rate limiting (login/register/password-reset/export) | ✅ verified (429) |
| XSS boundary (HTMLPurifier), CSRF, authorization, mass-assignment, file uploads | ✅ |
| DPDP consent capture | ✅ |
| DPDP privacy/terms notice | ✅ `/privacy`, `/terms` |
| DPDP data export (access/portability) | ✅ `/account/data-export` |
| DPDP erasure | ✅ `DELETE /account` (verified: PII scrubbed, content anonymised) |
| Grievance contact | ✅ config-driven |

Full audit: [`docs/SECURITY_DPDP.md`](docs/SECURITY_DPDP.md).

## Database & performance
- ✅ No N+1 on hot paths (2–11 queries/page measured).
- ✅ All FKs + hot filters indexed (3 index passes). New this cycle: `idx_app_response_sla`, `idx_users_company_name`, `users_github_id_unique`. Polymorphic `likes` + fulltext (jobs/topics) indexes present.
- Minor opportunity (not a bug): `getPublicJobs` uses `LIKE '%…%'` (can't use the existing fulltext index); could switch to `MATCH…AGAINST` if job volume grows.

## Bugs found & fixed in this QA pass
1. **Trust recompute trigger passed null** — `updateApplicationStatus` used `jobListing->user` (no such relation; it's `company`). Fixed.
2. **trust_score never persisted** — `updateTrustScoreForUser` used Eloquent `update()` on a guarded column; switched to `forceFill()->save()`. Recompute now writes real varied scores.

## Owner actions before production
- `.env`: `APP_DEBUG=false`, `APP_ENV=production`, `LOG_LEVEL=warning`, `APP_URL`, real SMTP, HTTPS (activates HSTS + secure cookies), `DEVRANK_GRIEVANCE_EMAIL`/`DEVRANK_ENTITY_NAME`.
- GitHub import: register an OAuth app, set `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` (callback `<APP_URL>/auth/github/callback`).
- Cron: `schedule:run` for daily `jobs:expire` + `devrank:recompute-scores` (SLA trust decay).
- `php artisan migrate` on any older DB; `migrate:fresh --seed` if demo data is stale.
- `ANTHROPIC_API_KEY` **not** required for phase 1 (leave `DEVRANK_AI_ENABLED=false`).
