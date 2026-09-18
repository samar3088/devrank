import { Head, Link } from '@inertiajs/react';

export default function Credential({ credential: c, token }) {
    const o = c.token_owner;
    const initials = (o.name || '?').split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('');

    return (
        <>
            <Head title={`${o.name} — DevRank Verified`} />
            <div className="container" style={{ padding: '48px 0 80px', maxWidth: 760 }}>
                <Link href="/" className="link-underline" style={{ fontSize: 14, color: 'var(--text3)' }}>← DevRank</Link>

                {/* Verified header */}
                <div className="dash-card" data-reveal="fade" style={{ marginTop: 18, display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg,#7c5cff,#22d3ee)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700,
                    }}>
                        {o.avatar ? <img src={o.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <h1 style={{ fontSize: '1.6rem', margin: 0 }}>{o.name}</h1>
                            <span style={{ color: 'var(--emerald, #10b981)', fontWeight: 700, fontSize: 14 }} title="Identity and activity verified by DevRank">✓ DevRank Verified</span>
                        </div>
                        <div style={{ color: 'var(--text3)', fontSize: 14, marginTop: 2 }}>
                            {o.headline || 'Developer'}{o.location ? ` · ${o.location}` : ''} · member since {c.member_since}
                        </div>
                    </div>
                    <Link href={`/candidate/${o.id}`} className="btn-sm btn-outline-sm pop-on-active">Full profile ↗</Link>
                </div>

                {/* Headline stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginTop: 16 }} data-reveal-stagger="80">
                    <Stat label="Global rank" value={`#${c.rank}`} sub={`of ${c.total.toLocaleString()} developers`} accent />
                    <Stat label="Rank score" value={c.score.toLocaleString()} sub="earned activity" />
                    <Stat label="Percentile" value={`Top ${c.percentile}%`} sub="on DevRank" />
                    {c.ai_enabled && <Stat label="% Human" value={`${Math.round(c.human_score)}%`} sub="AI-integrity" />}
                </div>

                {/* Tag rankings */}
                {c.tag_rankings?.length > 0 && (
                    <div className="dash-card" data-reveal style={{ marginTop: 16 }}>
                        <div className="dash-card-header"><h4>Skill rankings</h4></div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                            {c.tag_rankings.map((t) => (
                                <span key={t.tag_id} style={{ fontSize: 13, padding: '6px 12px', borderRadius: 20, background: 'rgba(124,92,255,.12)', border: '1px solid rgba(124,92,255,.3)' }}>
                                    <strong>#{t.rank}</strong> in {t.tag_name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* How it was earned (audit) */}
                <div className="dash-card" data-reveal style={{ marginTop: 16 }}>
                    <div className="dash-card-header"><h4>How this rank was earned</h4></div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginTop: 10 }}>
                        <Audit n={c.audit.accepted_answers} label="Accepted answers" />
                        <Audit n={c.audit.likes_received} label="Likes received" />
                        <Audit n={c.audit.quizzes_passed} label="Quizzes completed" />
                        <Audit n={c.audit.topics} label="Topics started" />
                    </div>
                    {c.github_verified && (
                        <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text2)' }}>🐙 GitHub identity verified</div>
                    )}
                </div>

                <p style={{ color: 'var(--text4)', fontSize: 12, marginTop: 20, lineHeight: 1.6 }}>
                    This page is generated live from DevRank’s records — the figures above are always current, never self-reported.
                    Verified {new Date(c.generated_at).toLocaleString()}. Credential ref <code>{token.slice(0, 8)}…</code>
                    {c.receipt && <> · Receipt <code title="Signed HMAC over this day’s rank/score — proves a screenshot wasn’t doctored">{c.receipt}</code></>}
                </p>
            </div>
        </>
    );
}

function Stat({ label, value, sub, accent }) {
    return (
        <div className="dash-card hover-lift" data-reveal style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: accent ? 'var(--cyan)' : 'var(--text)' }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>{sub}</div>
        </div>
    );
}

function Audit({ n, label }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{Number(n).toLocaleString()}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{label}</div>
        </div>
    );
}
