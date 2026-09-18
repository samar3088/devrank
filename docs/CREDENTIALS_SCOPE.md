# Scope — #2 Verifiable, embeddable rank credentials

_Design doc only (not yet built). Companion to the roadmap. Goal: let a candidate
embed a signed "DevRank Verified" badge in their GitHub README / LinkedIn /
portfolio that links back to a public, auditable "how this was earned" page._

## Why this is cheap + high-leverage
All the underlying data already exists and is computed:
- `users.total_rank_score` (earned activity), per-tag rankings via `TagRankingService`.
- `users.human_score` (AI-integrity %, candidates) — **gated by `aiEnabled`**; hidden in phase-1.
- `users.trust_score` (companies).
- Public profile already lives at `GET /candidate/{id}` (`PublicProfileController@candidateProfile`).

So this feature is a **rendering + signing + public-page** layer over existing values,
not new scoring. The badge markets the platform for us (inherently viral).

## Deliverables
1. **Badge image endpoint** — server-rendered SVG (crisp, cache-friendly, no JS).
2. **Public verification page** — human-readable "how this was earned" + audit trail.
3. **Embed snippet UI** — on the candidate's own dashboard/profile, copy-paste
   Markdown / HTML / URL for README, LinkedIn, portfolio.
4. **Signature/anti-forgery** so a badge can't be faked with a hand-edited URL.

## Data model
New table `credential_tokens` (one active token per candidate, rotatable):
- `id`, `user_id` (fk, unique), `token` (random 32-char, public — used in URLs),
  `revoked_at` (nullable), `created_at`.
- The `token` is the public handle in `/verify/{token}` and the badge URL; rotating
  it invalidates old embeds (candidate control / takedown).

No secret is stored per-row. Tamper-proofing uses an **HMAC** of the rendered
claim (see below), keyed by `config('devrank.credentials.secret')` (env
`DEVRANK_CREDENTIAL_SECRET`, falls back to `APP_KEY`).

## Endpoints (all public, read-only, no auth)
- `GET /badge/{token}.svg?metric=rank|tag:{slug}|human`
  → returns `image/svg+xml`. Shields-style pill: left label ("DevRank"),
    right value ("#3 React · 1,240 pts"). `Cache-Control: public, max-age=300`.
    Renders live from the DB each request (value stays current); ETag on the value.
- `GET /verify/{token}`
  → Inertia public page `Verify/Credential.jsx`: candidate name, headline, avatar,
    `total_rank_score`, global + per-tag rank, member-since, **and the audit list**
    (what earned the score: accepted answers, quiz passes, likes — read-only,
    counts + dates, no private data). Includes a "verified" checkmark and the
    timestamp the page was generated.
- `GET /candidate/dashboard` (existing) gains a **"Share your verified rank"**
  card: live badge preview + copy buttons for:
  - Markdown: `[![DevRank](https://APP_URL/badge/{token}.svg)](https://APP_URL/verify/{token})`
  - HTML `<a><img></a>`
  - Raw verify URL (for LinkedIn "Featured" / résumé).

## Metrics a badge can show
- `rank` — global: `#{globalRank} · {total_rank_score} pts`.
- `tag:{slug}` — e.g. `#3 in React` (from `TagRankingService::forCandidate`).
- `human` — `{human_score}% Human` — **only when `config('devrank.ai.enabled')`**.
  When AI is off (phase-1), the `human` metric 404s / falls back to `rank`, exactly
  mirroring the existing UI hiding of human_score. Keep this gate — do not leak a
  human_score readout through the badge while the rest of the app hides it.

## Anti-forgery / integrity
- The badge SVG and verify page are generated **server-side from the live DB**, so
  the displayed number is always real — a forged `?rank=9999` query is ignored
  (values are never read from the request).
- The `token` is unguessable and revocable; a leaked/edited token that doesn't
  exist → 404. No PII in the token.
- Optional (nice-to-have): stamp the verify page with an HMAC "receipt" so a
  screenshot/export can be re-verified — `hmac(user_id|score|date, secret)`.
- `robots`: verify page is indexable (SEO/virality); badge endpoint is not.

## Privacy (DPDP-aware — see SECURITY_DPDP.md)
- The verify page exposes **only already-public profile data** (name, headline,
  rank, tag ranks, public activity counts). No email/phone/resume/links — those
  stay behind the existing `canViewContact` gate in `PublicProfileService`.
- Candidate can **revoke** their credential token from their dashboard at any time
  (right-to-restrict-processing friendly): revoked → all embeds 404.
- Badges are opt-in: a token is minted only when the candidate first opens the
  "Share" card, not for every user by default.

## Effort estimate
- Migration + `CredentialToken` model + `CredentialService`: ~0.5 day.
- SVG badge renderer (no image lib — hand-built SVG string, measured widths): ~0.5 day.
- `Verify/Credential.jsx` public page + audit query: ~0.5–1 day.
- Dashboard "Share" card + copy-to-clipboard: ~0.5 day.
- Tests (token revoke, human-gate off, forged-query ignored): ~0.5 day.
**Total: ~2.5–3 days.** No third-party services, no runtime cost.

## Build order when picked up
1. Migration + model + service (mint/rotate/revoke, resolve token→user).
2. `/verify/{token}` page (reuses PublicProfileService data assembly).
3. `/badge/{token}.svg` renderer + caching + human-gate.
4. Dashboard share card.
5. Tests + docs; add `DEVRANK_CREDENTIAL_SECRET` to `.env.example`.
