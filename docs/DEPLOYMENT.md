# DevRank — Deployment Runbook (staging / production)

Practical guide to standing up DevRank on a server. The app is **code-complete**;
everything below is owner/infra configuration. Read `CLAUDE.md` for architecture
and `FEATURE-STATUS.md` for the feature scorecard.

> **Stack:** Laravel 12 (PHP 8.2) · Inertia + React 19 (Vite) · MySQL · queue =
> `database` · mail = SMTP. Assets are prebuilt with Vite (no Node needed at runtime,
> only at build time).

---

## 1. Server prerequisites
- **PHP 8.2** with extensions: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`,
  `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `curl`, `gd` (image uploads).
- **MySQL 8** (or MariaDB 10.6+).
- **Composer 2**.
- **Node 18+** — only to build assets (locally or in CI). Not required at runtime.
- A web server (nginx/Apache) with the docroot at **`public/`**, HTTPS enabled.

---

## 2. First deploy

```bash
# 1. Get the code
git clone https://github.com/samar3088/devrank.git
cd devrank

# 2. PHP deps (production, no dev tooling)
composer install --no-dev --optimize-autoloader --ignore-platform-reqs
#   ^ --ignore-platform-reqs: the lock pins symfony v8 (wants PHP 8.4) but runtime is 8.2 (pre-existing, safe).

# 3. Build front-end assets (on the build host / CI)
npm ci
npm run build            # outputs public/build (gitignored — must be built or shipped)

# 4. Environment
cp .env.example .env
#   → edit .env (see section 3), then:
php artisan key:generate

# 5. Database
php artisan migrate --force
php artisan db:seed --force        # OPTIONAL: demo data (candidates, jobs, hires, etc.)

# 6. Storage symlink (uploaded avatars / logos / forum images)
php artisan storage:link

# 7. Cache config & routes for speed
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Writable dirs: `storage/` and `bootstrap/cache/` must be writable by the web user.

> **Re-deploy** (subsequent releases): `git pull` → `composer install --no-dev -o
> --ignore-platform-reqs` → `npm ci && npm run build` → `php artisan migrate --force`
> → `php artisan config:cache route:cache view:cache` → restart the queue worker.

---

## 3. `.env` for staging / production

```dotenv
APP_NAME=DevRank
APP_ENV=production
APP_DEBUG=false                      # NEVER true in staging/prod
APP_URL=https://your-staging-domain  # exact scheme+host; drives links, cookies, GitHub callback
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=devrank
DB_USERNAME=...
DB_PASSWORD=...

# Queue + mail (REQUIRED for verification / password-reset emails)
QUEUE_CONNECTION=database
MAIL_MAILER=smtp
MAIL_HOST=...
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@your-domain"
MAIL_FROM_NAME="DevRank"

# DPDP data-fiduciary details (shown in privacy/grievance UI)
DEVRANK_ENTITY_NAME="Your Legal Entity"
DEVRANK_GRIEVANCE_EMAIL="privacy@your-domain"
DEVRANK_GRIEVANCE_OFFICER="Data Protection Officer"
```

**HTTPS is important:** the `SecurityHeaders` middleware only emits **HSTS** over
https, and secure cookies require it.

### Feature switches (all off by default — the app runs fully without them)
```dotenv
# Coding execution (Judge0) — LEFT OFF by decision → quizzes are MCQ-only.
#   To enable later: run a Judge0 sandbox and set JUDGE0_URL=... (see CLAUDE.md #1).

# GitHub import — enable AFTER deploy (see section 6).
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
# GITHUB_REDIRECT_URI="${APP_URL}/auth/github/callback"

# AI human-check — on hold. To enable: DEVRANK_AI_ENABLED=true + ANTHROPIC_API_KEY.

# Real-time notifications (optional; polling works without it):
# BROADCAST_CONNECTION=reverb + REVERB_*/VITE_REVERB_* then `php artisan reverb:start`.
```

---

## 4. Queue worker (REQUIRED)

Email verification and password-reset notifications are **queued** (`ShouldQueue`).
Without a running worker they sit in the `jobs` table and never send.

Run under a supervisor so it restarts on crash/deploy. Example Supervisor program:

```ini
[program:devrank-queue]
command=php /path/to/devrank/artisan queue:work --queue=default --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/path/to/devrank/storage/logs/queue.log
```
Restart it on every deploy: `php artisan queue:restart`.

---

## 5. Scheduler (cron)

One system cron entry drives all scheduled work (daily `jobs:expire` +
`devrank:recompute-scores` for SLA trust decay and rank-up notifications):

```cron
* * * * * cd /path/to/devrank && php artisan schedule:run >> /dev/null 2>&1
```

---

## 6. GitHub import — enable after deployment

The "Connect GitHub" UI stays hidden until credentials exist, so do this once the
staging URL is live:

1. github.com/settings/developers → **New OAuth App**.
   - **Homepage URL:** `https://<staging-domain>`
   - **Authorization callback URL:** `https://<staging-domain>/auth/github/callback`
     (must match `APP_URL` + `/auth/github/callback` **exactly**).
2. Copy the **Client ID**, generate a **Client secret**.
3. Set `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `GITHUB_REDIRECT_URI` in `.env`.
4. `php artisan config:clear` (or re-run `config:cache`).
5. The connect card appears on the candidate dashboard automatically.

> One OAuth app = one callback URL, so use a **separate** app for local vs staging vs prod.

---

## 7. Post-deploy smoke test

- [ ] Home, `/forum`, `/jobs`, `/leaderboard`, `/interviews`, `/challenges`,
      `/salaries` load (200) as a guest.
- [ ] Register a candidate + a company; verify the **verification email arrives**
      (proves queue worker + SMTP).
- [ ] Candidate: answer a forum question, take an MCQ quiz, apply to a job.
- [ ] Company: post a job, see the applicant, move status (rejection needs a reason),
      record a hire → candidate confirms on `/hires`.
- [ ] `/salaries` shows aggregate bands (needs ≥3 shared verified hires; seeded data has them).
- [ ] Admin (`admin@devrank.com`): dashboard, moderation, quiz management load.
- [ ] `/privacy`, `/terms` load; `/account/settings` → data export downloads; erasure works.
- [ ] Confirm `APP_DEBUG=false` (error pages don't leak stack traces).

**Seeded logins** (if you ran `db:seed`): super-admin `admin@devrank.com` / `Admin@123`,
company `harshit@techventures.com` / `Demo@123`, candidate `arjun@devrank.com` / `Demo@123`.
**Rotate/remove seeded demo accounts before a public/production launch.**

---

## 8. Notes
- `public/build` is gitignored — it must be built during deploy (or shipped by CI).
- Demo data is time-anchored; if a staging demo looks empty (expired jobs), re-run
  `php artisan migrate:fresh --seed --force`.
- Deferred by choice (all one-env-var to enable later): Judge0 (coding), GitHub OAuth,
  AI human-check. None block launch.
