# Security & DPDP Compliance — Audit + Implementation

_Audit of the DevRank codebase and the concrete measures implemented this pass.
DPDP = India's Digital Personal Data Protection Act, 2023._

## Security audit findings

| Area | Status | Notes |
|---|---|---|
| **XSS** | ✅ Strong | Forum bodies sanitized server-side via HTMLPurifier (`HtmlSanitizer`) — single trust boundary. React escapes by default elsewhere. |
| **CSRF** | ✅ | Laravel VerifyCsrfToken on the web group; notification fetches send `X-XSRF-TOKEN`. |
| **Authorization** | ✅ | Routes role-gated (Spatie); write actions owner-scoped (`abort(403)` on non-owner) — verified for jobs, applicants, quiz, interests. |
| **Mass assignment** | ✅ | All models use `$fillable`; erasure uses `forceFill` deliberately. |
| **SQL injection** | ✅ | Query builder / bindings throughout; the one `DB::raw` (interview points) interpolates a cast `int` from config, not user input. |
| **Password storage** | ✅ | `bcrypt` (hashed cast); registration enforces `Password::min(8)->mixedCase()->numbers()`. |
| **File uploads** | ✅ | Forum image + résumé/logo validated by `mimes` + `max` size (`config/devrank.upload`). |
| **Auth brute force** | ⛏ Fixed | **Added** `throttle` to login (5/min), register (10/min), password-reset (5/min & 6/min). |
| **Security headers** | ⛏ Fixed | **Added** `SecurityHeaders` middleware: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Permitted-Cross-Domain-Policies, HSTS (https only). |
| **Secrets** | ✅ | `.env` git-ignored & untracked; keys in env. |

### Owner actions before production (not code)
- `APP_DEBUG=false`, `APP_ENV=production`, `LOG_LEVEL=warning`.
- Serve over **HTTPS** (activates HSTS + `secure` cookies).
- Set real `DEVRANK_GRIEVANCE_EMAIL` / `DEVRANK_ENTITY_NAME`.
- Run `php artisan migrate` (consent + SLA columns) and `schedule:run` (cron) for daily score/SLA recompute.
- CSP is intentionally not enforced (Vite/Inertia inline assets need nonces) — add a nonce-based policy later if required.

## DPDP compliance — implemented this pass

| DPDP obligation | Implementation |
|---|---|
| **Consent (informed, at collection)** | Mandatory consent checkbox at registration (`consent: accepted`), linking to Privacy Policy + Terms; timestamp stored in `users.consented_at`. Legacy accounts backfilled at signup time. |
| **Notice / transparency** | Public **Privacy Policy** (`/privacy`) and **Terms** (`/terms`) pages: data collected, purpose, what's public vs. private, rights, retention, grievance contact. |
| **Right to access & portability** | `GET /account/data-export` streams a full JSON of the user's personal data (profile, forum, applications, outreach, quiz, notifications). |
| **Right to correction** | Existing profile edit flows. |
| **Right to erasure** | `DELETE /account` (password-confirmed): personal fields scrubbed, email released, account soft-deleted; authored content anonymised (not destroyed) to preserve platform integrity. `AccountService::eraseAccount`. |
| **Withdraw consent** | Erasure withdraws consent to further processing. |
| **Purpose limitation / data minimization** | Contact details gated server-side (`PublicProfileService::canViewContact`) — never sent to unauthorised clients. |
| **Grievance redressal** | Grievance officer + email in privacy notice and account settings (`config/devrank.privacy`). |

### Self-service hub
`GET /account/settings` (`Settings/Account.jsx`) — export + delete in one place, with grievance contact.

## Key files
- `app/Http/Middleware/SecurityHeaders.php`
- `app/Http/Controllers/AccountController.php`, `LegalController.php`
- `app/Services/AccountService.php` (personal-data surface — update here when adding personal fields)
- `resources/js/Pages/Legal/{Privacy,Terms}.jsx`, `resources/js/Pages/Settings/Account.jsx`
- Migrations: `…_add_consent_to_users.php`
- `config/devrank.php` → `privacy.*`
