# DevRank — Functional Specification

_What the portal does, reconstructed from the codebase (routes, controllers, services, pages) on 2026-09-14._
_This is the authoritative feature/role reference. For engineering conventions and gotchas, see [`CLAUDE.md`](../CLAUDE.md)._

DevRank is a **merit-based developer ranking & hiring platform**. Developers build a
public, verifiable track record (forum answers, AI-proctored skill quizzes, interview
reviews); companies post jobs and reach out to ranked talent; admins moderate. The
premise: _your knowledge is your resume_ — ranking is earned by activity, not claimed by CV.

- **Stack:** Laravel 12 (PHP 8.2) · Inertia.js + React 19 · MySQL · Spatie roles.
- **Global config:** [`config/devrank.php`](../config/devrank.php).

---

## Roles at a glance

| Role | Gets in via | Core capability |
|------|-------------|-----------------|
| **guest** (public) | no login | Browse forum, jobs, leaderboard, public profiles, interview board, quizzes (read-only) |
| **candidate** | self-register | Build rank: forum Q&A, take quizzes, post interview reviews, apply to jobs, respond to outreach |
| **company** | self-register | Post jobs, send candidate outreach, manage company profile, earn a public trust score |
| **sub_admin** | granted by super-admin | Full moderation panel (users, jobs, forum, tags, logs, analytics) — **no** quiz management |
| **super_admin** | first-ever registered user, auto-assigned | Everything sub-admin can do **plus** full quiz/question/attempt management |

**Access gates:** every signed-in area requires a **verified email** _and_ an **active** account
(`is_active`). A deactivated user is force–logged-out at login with a "contact support" message.
Monthly limit counters reset on the first request of a new calendar month.

**The three scores:**
- **`total_rank_score`** — earned activity points (forum likes/replies/accepts + quiz points).
- **`human_score`** (candidates, 0–100) — % of a candidate's coding answers **not** AI-flagged. No coding answers ⇒ defaults to 100.
- **`trust_score`** (companies, 0–100) — `100 − (% of visible interview reviews with outcome = "ghosted")`. No reviews ⇒ defaults to 100. Matched to companies by `company_name`. Honest rejections don't hurt it.

**Points & limits** ([`config/devrank.php`](../config/devrank.php)):

| Points | Value | | Monthly limits | Value |
|--------|-------|---|----------------|-------|
| Like received | +10 | | Job applications (candidate) | 5 |
| Reply posted | +5 | | Job posts (company) | 5 |
| Answer accepted | +50 | | Outreach sent (company) | 10 |
| Quiz MCQ correct | +10 | | Max tags per topic | 10 |
| Quiz coding pass | +40 | | Job expiry | 30 days |

---

## 1. Authentication & accounts

- **Registration** — one combined form; the user picks role `candidate` or `company`.
  - Password rule: min 8, mixed case, numbers, confirmed.
  - **Company** captures `company_name`, `company_website` (URL), `industry`.
  - **Candidate** captures `primary_skill` (→ headline) and `years_of_experience` (bucketed to an int: 0–1→0, 1–3→2, 3–5→4, 5–8→6, 8+→9).
  - **The very first user ever created is force-assigned `super_admin`**, regardless of submitted role.
  - Registration fires a verification email, logs the user in, and lands on `/dashboard`.
- **Login** — email/password with optional "remember"; generic error on bad credentials; deactivated accounts are rejected after auth and logged back out.
- **Email verification** — required to reach the dashboard and every candidate/company/admin action. Notice page + signed verify link + throttled resend.
- **Password reset** — standard broker flow (request link → token form → reset), same password-strength rule; friendly messages for invalid/expired/throttled.

## 2. Dashboards

`/dashboard` routes by role: admins → admin dashboard; companies → company stats; candidates → candidate stats.

- **Candidate dashboard** — rank score, human score, global rank position + percentile; forum totals (replies, topics, likes, accepted answers); per-tag rankings; quiz stats (attempts, passed, points); job-application counts + monthly remaining; interest counts; profile-view count; an 8-week rank-history chart; a "pending actions" nudge list; demand signals; and a 5-pillar score summary.
- **Company dashboard** — total/active jobs, total & new applications, interests sent/accepted, monthly posts & outreach remaining, and an application-pipeline breakdown (applied → reviewing → shortlisted → interview → offered).
  > ⚠️ **Known gap:** the current page renders several hardcoded values (Trust Score, pipeline, alerts) and reads stat keys the service doesn't emit — it is largely mock against real data. See _Known gaps_ below.
- **Admin dashboard** — platform stat cards: total candidates/companies/topics/jobs, active jobs, total applications, pending tags, flagged replies, new signups this week.
  > ⚠️ **Known gap:** page references two stats not provided (render as 0) and shows a "coming soon" note even though the full admin panel exists.

## 3. Forum (Q&A)

- **Public:** topic list with search, category, and filters (hot / this week / unanswered / pinned+recent); paginated. Sidebars: categories, top-5 contributors, trending tags. Topic detail counts views and lists visible replies sorted **accepted → most-liked → oldest**.
- **Candidate actions:**
  - **Create topic** — title 10–255, body ≥30, category required, up to 10 tags. Unique slug. _No points for creating a topic._
  - **Reply** — body ≥10; **+5** to author.
  - **Accept answer** — topic-owner only; awards **+50** to the answerer; toggling moves/removes the +50 correctly.
  - **Like** — toggle a like; **+10** to the reply author; **self-likes earn nothing**.
  - **Edit / delete reply** — owner only; deleting reverses **−5** (and **−50** if it was accepted).
  - **Delete topic** — owner only (soft delete).
  - Scores can never go negative (floored at 0).

## 4. Quizzes (AI-proctored skill tests)

- **Browse/show:** public list of published quizzes filtered by tag/difficulty. Detail hides correct answers; signed-in candidates see their attempt summary.
- **Attempt lifecycle (candidate-only):**
  - **Start** — resumes an in-progress attempt; `max_attempts = 0` means unlimited; records attempt number and previous best (for delta ranking).
  - **Answer** — per-question, idempotent; MCQ vs coding auto-detected. The Monaco editor captures **paste count** and **time spent** as anti-cheat signals.
    - **MCQ** graded instantly (correct = the flagged option).
    - **Coding** graded by AI: `marks = ai_flagged ? 0 : round(quality/10 × marks)`; "correct" if quality ≥ 7.
  - **Complete** — time limit enforced (+30s grace); score summed; passes if % ≥ passing score; awards the **delta** to `total_rank_score`, then recomputes human score.
  - **Result** — owner-only view with per-answer breakdown and history.
- **AI scoring / proctoring** ([`AiScoringService`](../app/Services/AiScoringService.php)): blends a typing/paste heuristic (30%) with an API quality score (70%); flags likely-AI answers at threshold **7.0**. On API failure it falls back to a neutral **5.0** ("manual review") — grading degrades, never crashes. Requires `ANTHROPIC_API_KEY`.
- **Delta ranking model:** attempt 1 earns full points; later attempts earn only `max(0, this − best previous)`, so **retaking can only raise your rank, never lower it**. AI-flagged answers contribute **0**.
- **human_score** recomputed on every completion = % of the candidate's coding answers not AI-flagged.

## 5. Jobs

- **Public board:** active, non-expired jobs; filter by search/type/work-mode/experience/tag; featured jobs float to the top; paginated. Detail counts views; candidates see `hasApplied` / `canApply`.
- **Candidate apply:** cover letter ≤2000; job must be active + non-expired; **max 5 applications/month**; duplicates blocked; creates an application in `applied` status.
- **Company job CRUD** (owner-scoped):
  - **Create** — **max 5 posts/month**; validated `job_type` (full-time/part-time/contract/freelance/internship), `work_mode` (remote/onsite/hybrid), `experience_level` (junior/mid/senior/lead/principal); salary max ≥ min; ≤10 tags. New jobs go live immediately (`active`, published now, expires in 30 days; currency INR, yearly).
  - **Edit / update** — status can be set to `active`, `paused`, or `closed`; tags re-synced.
  - **Delete** — soft delete.
- **Job status enum:** `active` · `paused` · `closed` · `expired`. New jobs are always `active` (no draft path). A daily `jobs:expire` command flips past-expiry active jobs to `expired`.
- **Featured** (`is_featured`) is **admin-only** — companies cannot self-promote.

## 6. Interests / outreach (company → candidate)

- **Send** (company) — message 20–500 chars; can't message yourself; **one request per candidate ever** (any prior status blocks a resend); **max 10/month**; created `pending`.
- **Respond** (candidate) — accept or decline while pending. **Accepting writes a `ProfileViewLog` (`interest_accept`)** — this grants the company full-profile access and feeds the candidate's "profile views."
- **What each side sees:** candidate sees received requests (pending first) + a pending count; company sees sent requests + monthly sent/limit/remaining. A candidate's public profile shows the current interest status to a viewing company.

## 7. Interview board (crowd-sourced interview reviews)

- **Public board:** visible reviews with filters (search, outcome, company, difficulty, period); paginated. Shows top companies (by review volume) and aggregate stats (totals, distinct companies, avg difficulty, selection rate, outcome distribution).
- **Post a review** (candidate) — company name, role, interview date (≤ today), 1–8 rounds (each with type + difficulty + optional notes), outcome (selected / rejected / ghosted / pending), difficulty & experience ratings (1–5), optional tips ≤1000. Created `visible`; the company's trust score is recomputed.
- **Report** (any verified user) — increments a report counter; **auto-hides the review at ≥5 reports** (status → moderated) and recomputes trust score.
- **Delete** — author only.
- **trust_score** = `100 − % of a company's visible reviews marked "ghosted"`; recomputed on review create and on auto-hide.

## 8. Leaderboard & public profiles

- **Leaderboard:** active candidates with `total_rank_score > 0`, ranked desc, paginated; shows likes received + topic/reply counts. Filter by **name** or **tag** (candidates with replies in topics carrying that tag). Tag dropdown from approved tags.
- **Candidate public profile:** headline, location, bio, experience, open-to-work, rank & human score, GitHub/LinkedIn, resume, avatar; plus reply/topic counts, likes received, global rank, top-5 recent answers, and per-tag rankings. Viewing companies see their outreach status.
- **Company public profile:** company details, up to 5 active jobs, total jobs count.
- **Tag-based ranking:** for a candidate's top tags (by likes earned on their answers within each tag), computes their rank within each tag. Shared by dashboard and profile.
- **Who-viewed tracking (`ProfileViewLog`):** rows created when a candidate accepts an interest; candidate dashboard surfaces the count; admins can browse all logs.

## 9. Admin panel

All admin routes require verified + role. **General panel** = `super_admin | sub_admin`; **quiz management** = `super_admin` only.

- **Dashboard & analytics** — platform stat cards; analytics builds 8-week series (new candidates, companies, applications, topics, completed quiz attempts), top-5 tags, and totals including AI-flagged attempts (Recharts).
- **Users & companies** — enable/disable accounts (`is_active` toggle). This is what the login active-gate keys off. Candidate list ranked; company list shows job/interest counts.
- **Job moderation** — toggle featured; set status (active/paused/closed/expired); job list with application counts.
- **Forum moderation** — topics list (incl. soft-deleted); moderation queue of flagged/moderated replies; restore or delete a reply. Interview reviews auto-enter the queue via the 5-report threshold.
- **Tags** — approve / reject suggested tags. Approved tags feed all forum/job/quiz dropdowns and leaderboard filters.
- **Profile-view logs** — browse all view logs, searchable by company name.
- **Quiz management (super_admin only)** — quiz CRUD (difficulty, time limit 5–180, passing score, max attempts 0–5, draft/published); questions (MCQ with 2–4 options & exactly one correct, or coding in JS/PHP/Python/Java/C++, marks 1–100); attempt review with per-quiz stats and AI-flag surfacing.

---

## Known code-vs-UI gaps (as of reconstruction)

These are real inconsistencies found while reading the code, worth tracking (not blockers):

1. **Company dashboard** renders hardcoded Trust Score / pipeline / alerts and reads stat keys the service never emits (`CompanyDashboard.jsx` vs `DashboardService::getCompanyStats`) — largely mock against live data.
2. **Admin dashboard** references two stats not provided by `getDashboardStats` (render as 0) and shows a "coming soon" note despite the full admin panel existing.
3. **Candidate dashboard** shows a "+15 pts for an interview review" nudge, but no such award exists in `InterviewService` — the label is cosmetic.

---

_Generated with [Claude Code](https://claude.com/claude-code)._
