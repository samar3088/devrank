<?php

namespace App\Services;

use App\Models\CredentialToken;
use App\Models\Reply;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Verifiable, embeddable rank credentials (#2). Mints a public, revocable token
 * per candidate that backs a signed "DevRank Verified" badge (SVG) and a public
 * audit page. Every value is rendered server-side from the live DB, so a badge
 * can't be forged by editing a URL.
 */
class CredentialService
{
    /** The candidate's active token, or null. */
    public function activeToken(User $user): ?CredentialToken
    {
        return CredentialToken::where('user_id', $user->id)->active()->latest()->first();
    }

    /** Ensure the candidate has an active token (mint on first share). */
    public function ensureToken(User $user): CredentialToken
    {
        return $this->activeToken($user) ?? CredentialToken::create([
            'user_id' => $user->id,
            'token'   => $this->freshToken(),
        ]);
    }

    /** Revoke the current token, mint a new one (invalidates old embeds). */
    public function rotate(User $user): CredentialToken
    {
        $this->revoke($user);
        return $this->ensureToken($user);
    }

    /** Revoke all active tokens — every embed 404s (right to restrict). */
    public function revoke(User $user): void
    {
        CredentialToken::where('user_id', $user->id)->active()->update(['revoked_at' => now()]);
    }

    /** Resolve a public token to its (active, candidate) user, or null. */
    public function resolve(string $token): ?User
    {
        $row = CredentialToken::where('token', $token)->active()->first();
        if (! $row) {
            return null;
        }
        $user = $row->user;
        if (! $user || ! $user->is_active || ! $user->hasRole('candidate')) {
            return null;
        }
        return $user;
    }

    private function freshToken(): string
    {
        do {
            $token = Str::lower(Str::random(32));
        } while (CredentialToken::where('token', $token)->exists());

        return $token;
    }

    /** 1-based global leaderboard position by total_rank_score. */
    public function globalRank(User $user): int
    {
        return User::role('candidate')
            ->where('total_rank_score', '>', $user->total_rank_score)
            ->count() + 1;
    }

    /**
     * Everything the public verify page shows — already-public data only
     * (no email/phone/resume/links). Also used to feed badge values.
     */
    public function verifyData(User $user): array
    {
        $rank  = $this->globalRank($user);
        $total = User::role('candidate')->count();

        $acceptedAnswers = Reply::where('user_id', $user->id)->where('is_accepted', true)->count();
        $likesReceived   = (int) Reply::where('user_id', $user->id)->where('status', 'visible')->sum('likes_count');
        $topics          = Topic::where('user_id', $user->id)->count();
        $quizzesPassed   = DB::table('quiz_attempts')
            ->where('user_id', $user->id)->where('status', 'completed')->count();

        $tags = app(TagRankingService::class)->forCandidate($user->id, 5);

        return [
            'token_owner' => [
                'id'        => $user->id,
                'name'      => $user->name,
                'headline'  => $user->headline,
                'avatar'    => $user->avatar,
                'location'  => $user->location,
            ],
            'rank'            => $rank,
            'total'           => $total,
            'percentile'      => $total > 0 ? max(1, (int) round((1 - $rank / $total) * 100)) : 0,
            'score'           => (int) $user->total_rank_score,
            'human_score'     => (float) $user->human_score,
            'ai_enabled'      => (bool) config('devrank.ai.enabled'),
            'member_since'    => optional($user->created_at)->format('M Y'),
            'github_verified' => $user->github_verified_at !== null,
            'tag_rankings'    => $tags,
            'audit'           => [
                'accepted_answers' => $acceptedAnswers,
                'likes_received'   => $likesReceived,
                'topics'           => $topics,
                'quizzes_passed'   => $quizzesPassed,
            ],
            'generated_at'    => now()->toIso8601String(),
            // HMAC receipt over the day's claim — lets a screenshot/export be
            // re-attested (the value can't be fabricated without the server secret).
            'receipt'         => $this->receipt($user->id, $rank, (int) $user->total_rank_score),
        ];
    }

    /** Short HMAC over (user, rank, score, date) keyed by the credential secret. */
    public function receipt(int $userId, int $rank, int $score, ?string $date = null): string
    {
        $date ??= now()->toDateString();
        $secret = (string) config('devrank.credentials.secret');
        return substr(hash_hmac('sha256', "{$userId}|{$rank}|{$score}|{$date}", $secret), 0, 16);
    }

    /**
     * Build the label/value shown on a badge for a given metric.
     * Returns null for a metric that isn't available (e.g. human while AI is off,
     * or an unknown tag) so the controller can 404 cleanly.
     */
    public function badgeContent(User $user, string $metric): ?array
    {
        if ($metric === 'human') {
            if (! config('devrank.ai.enabled')) {
                return null; // never leak human_score while the rest of the app hides it
            }
            return ['DevRank', round((float) $user->human_score) . '% Human'];
        }

        if (Str::startsWith($metric, 'tag:')) {
            $slug = Str::after($metric, 'tag:');
            $tags = app(TagRankingService::class)->forCandidate($user->id, 50);
            $match = collect($tags)->first(fn ($t) => ($t['tag_slug'] ?? null) === $slug);
            if (! $match) {
                return null;
            }
            return ['DevRank', "#{$match['rank']} in {$match['tag_name']}"];
        }

        // default: global rank
        $rank = $this->globalRank($user);
        return ['DevRank', "#{$rank} · " . number_format($user->total_rank_score) . ' pts'];
    }

    /**
     * Render a shields-style two-segment SVG badge. Hand-built (no image lib) so
     * it stays tiny and cache-friendly; widths are estimated from text length.
     */
    public function badgeSvg(string $label, string $value): string
    {
        $charW = 6.6;
        $pad = 12;
        $lw = (int) ceil(strlen($label) * $charW + $pad * 2);
        $vw = (int) ceil(strlen($value) * $charW + $pad * 2);
        $w  = $lw + $vw;
        $h  = 28;
        $lx = $lw / 2;
        $vx = $lw + $vw / 2;

        $labelEsc = htmlspecialchars($label, ENT_QUOTES);
        $valueEsc = htmlspecialchars($value, ENT_QUOTES);

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="{$w}" height="{$h}" role="img" aria-label="{$labelEsc}: {$valueEsc}">
  <linearGradient id="a" x2="0" y2="100%"><stop offset="0" stop-color="#0f172a"/><stop offset="1" stop-color="#111827"/></linearGradient>
  <linearGradient id="b" x2="0" y2="100%"><stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#6d4bf0"/></linearGradient>
  <rect rx="5" width="{$w}" height="{$h}" fill="#111827"/>
  <rect rx="5" width="{$lw}" height="{$h}" fill="url(#a)"/>
  <rect rx="5" x="{$lw}" width="{$vw}" height="{$h}" fill="url(#b)"/>
  <rect rx="5" width="{$w}" height="{$h}" fill="transparent" stroke="#000" stroke-opacity=".1"/>
  <g fill="#fff" text-anchor="middle" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-size="12" font-weight="600">
    <text x="{$lx}" y="19" fill="#c7d2fe">{$labelEsc}</text>
    <text x="{$vx}" y="19">{$valueEsc}</text>
  </g>
</svg>
SVG;
    }
}
