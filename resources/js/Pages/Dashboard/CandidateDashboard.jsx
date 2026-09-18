import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';
import CountUp from '@/Components/CountUp';

export default function CandidateDashboard() {
    const { stats, auth, aiEnabled, githubEnabled } = usePage().props;
    const user = auth?.user;
    const gh = stats?.github;

    // Weekly rank chart — from DashboardService.getWeeklyRankHistory()
    const history  = stats?.weekly_history ?? [];
    const maxScore = history.length ? Math.max(...history.map(h => h.score), 1) : 1;

    return (
        <MainLayout>
            <Head title="Dashboard" />
            <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>

                {/* ── Header ─────────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ marginBottom: 4 }}>Welcome back, {user?.name?.split(' ')[0]}</h1>
                        <p style={{ color: 'var(--text3)', fontSize: 14, margin: 0 }}>
                            Global Rank <strong style={{ color: 'var(--cyan)' }}>#{stats?.rank_position ?? '—'}</strong>
                            {' '}· Top <strong style={{ color: 'var(--cyan)' }}>{stats?.rank_percentile ?? 0}%</strong>
                            {' '}of {stats?.total_candidates?.toLocaleString() ?? 0} candidates
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Link href={`/candidate/${user?.id}`} className="btn btn-ghost btn-sm">
                            View Public Profile
                        </Link>
                        <Link href="/forum/create" className="btn btn-ghost btn-sm">
                            + New Topic
                        </Link>
                        <Link href="/quiz" className="btn btn-primary btn-sm">
                            + Take a Quiz
                        </Link>
                    </div>
                </div>

                {/* ── Pending hire confirmations (#11) ────────────── */}
                <PendingHiresCard hires={stats?.pending_hires ?? []} />

                {/* ── GitHub verified import (roadmap #6) ─────────── */}
                {githubEnabled && (
                    gh?.verified ? (
                        <div className="dash-card hover-lift" data-reveal="fade" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 30 }}>🐙</div>
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    GitHub Verified
                                    <span style={{ color: 'var(--emerald, #10b981)', fontSize: 13 }}>✓ @{gh.username}</span>
                                </div>
                                <div style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>
                                    <CountUp end={gh.stats?.public_repos ?? 0} /> repos · <CountUp end={gh.stats?.stars ?? 0} /> stars
                                    {gh.stats?.top_language ? <> · {gh.stats.top_language}</> : null}
                                    {' '}· <strong style={{ color: 'var(--cyan)' }}>+{gh.stats?.points_awarded ?? 0} pts</strong>
                                </div>
                            </div>
                            <a href="/auth/github/redirect" className="btn-sm btn-outline-sm pop-on-active">Refresh</a>
                        </div>
                    ) : (
                        <div className="dash-card hover-lift" data-reveal="fade" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 30 }}>🐙</div>
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <div style={{ fontWeight: 600 }}>Verify your GitHub</div>
                                <div style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>
                                    Import your public repos, stars and top language as a verified rank signal — and earn rank points for real contributions.
                                </div>
                            </div>
                            <a href="/auth/github/redirect" className="btn btn-primary btn-sm pop-on-active">Connect GitHub</a>
                        </div>
                    )
                )}

                {/* ── Verifiable rank credential (#2) ─────────────── */}
                <CredentialCard token={stats?.credential_token} userId={user?.id} />

                {/* ── Smart job matches (#4) ─────────────────────── */}
                <MatchesCard matches={stats?.job_matches ?? []} openToWork={stats?.open_to_work} anonymous={stats?.anonymous} />

                {/* ── Top Stats Row ──────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }} data-reveal-stagger="80">
                    <StatCard
                        label="Rank Score"
                        value={<CountUp end={stats?.rank_score ?? 0} />}
                        sub={`#${stats?.rank_position ?? '—'} globally`}
                        color="var(--cyan)"
                    />
                    {aiEnabled ? (
                        <StatCard
                            label="Human Score"
                            value={<CountUp end={stats?.human_score ?? 0} suffix="%" />}
                            sub="AI integrity check"
                            color="var(--emerald)"
                        />
                    ) : (
                        <StatCard
                            label="Profile Views"
                            value={<CountUp end={stats?.profile_views ?? 0} />}
                            sub="by companies"
                            color="var(--emerald)"
                        />
                    )}
                    <StatCard
                        label="Forum Answers"
                        value={<CountUp end={stats?.total_replies ?? 0} />}
                        sub={`${stats?.total_likes ?? 0} likes received`}
                        color="var(--violet-bright)"
                    />
                    <StatCard
                        label="Quizzes Passed"
                        value={<CountUp end={stats?.quizzes_passed ?? 0} />}
                        sub={`of ${stats?.quiz_attempts ?? 0} attempted`}
                        color="var(--champagne)"
                    />
                </div>

                {/* ── Rank Chart + Pending Actions ──────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

                    {/* Rank chart */}
                    <div className="dash-card hover-lift" data-reveal>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h4>Rank Score History</h4>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cyan)' }}>
                                {stats?.rank_score?.toLocaleString() ?? 0} pts
                            </span>
                        </div>
                        {history.length > 0 ? (
                            <>
                                <div className="rank-chart">
                                    {history.map((week, i) => {
                                        const h = Math.round((week.score / maxScore) * 100);
                                        return (
                                            <div
                                                key={i}
                                                className={`rank-bar${i === history.length - 1 ? ' current' : ''}`}
                                                style={{ height: `${Math.max(h, 4)}%` }}
                                                title={`${week.label}: ${week.score.toLocaleString()} pts`}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="rank-chart-labels">
                                    {history.map((w, i) => <span key={i}>{w.label}</span>)}
                                </div>
                            </>
                        ) : (
                            <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 13 }}>
                                Earn points to see your rank history
                            </div>
                        )}
                    </div>

                    {/* Pending Actions */}
                    <div className="dash-card hover-lift" data-reveal>
                        <h4 style={{ marginBottom: 14 }}>Pending Actions</h4>

                        {(stats?.interests_pending ?? 0) > 0 && (
                            <div className="nudge-card">
                                📨 <strong>{stats.interests_pending} company interest{stats.interests_pending > 1 ? 's' : ''}</strong> waiting for your response
                                <Link href="/interests" style={{ marginLeft: 8, fontSize: 12, color: 'var(--cyan)' }}>Review →</Link>
                            </div>
                        )}

                        {(stats?.untaken_quiz_count ?? 0) > 0 && (
                            <div className="nudge-card">
                                🎯 <strong>{stats.untaken_quiz_count} quiz{stats.untaken_quiz_count > 1 ? 'zes' : ''}</strong> available — take them to boost your rank
                                <Link href="/quiz" style={{ marginLeft: 8, fontSize: 12, color: 'var(--cyan)' }}>Browse →</Link>
                            </div>
                        )}

                        {(stats?.total_replies ?? 0) === 0 && (
                            <div className="nudge-card">
                                💬 Answer your first <strong>forum question</strong> to start building your rank
                                <Link href="/forum" style={{ marginLeft: 8, fontSize: 12, color: 'var(--cyan)' }}>Go to Forum →</Link>
                            </div>
                        )}

                        <div className="nudge-card">
                            📝 Share an <strong>interview review</strong> to help other candidates — earn +15 pts
                            <Link href="/interviews/create" style={{ marginLeft: 8, fontSize: 12, color: 'var(--cyan)' }}>Write Review →</Link>
                        </div>

                        {(stats?.monthly_app_remaining ?? 0) > 0 && (
                            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
                                {stats.monthly_app_remaining} job application{stats.monthly_app_remaining > 1 ? 's' : ''} remaining this month
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Demand Signals + Tag Rankings ─────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

                    {/* Demand Signals */}
                    <div className="dash-card hover-lift" data-reveal>
                        <h4 style={{ marginBottom: 14 }}>Demand Signals</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div className="demand-row">
                                <span>Profile views (total)</span>
                                <strong style={{ color: 'var(--cyan)' }}>{stats?.profile_views ?? 0}</strong>
                            </div>
                            <div className="demand-row">
                                <span>Interests received</span>
                                <strong style={{ color: 'var(--cyan)' }}>{(stats?.interests_pending ?? 0) + (stats?.interests_accepted ?? 0)}</strong>
                            </div>
                            <div className="demand-row">
                                <span>Interests accepted</span>
                                <strong style={{ color: 'var(--emerald)' }}>{stats?.interests_accepted ?? 0}</strong>
                            </div>
                            <div className="demand-row">
                                <span>Likes on answers</span>
                                <strong>{stats?.total_likes ?? 0}</strong>
                            </div>
                            <div className="demand-row">
                                <span>Accepted answers</span>
                                <strong style={{ color: 'var(--violet-bright)' }}>{stats?.accepted_answers ?? 0}</strong>
                            </div>
                            <div className="demand-row">
                                <span>Jobs applied</span>
                                <strong>{stats?.total_applications ?? 0}</strong>
                            </div>
                            <div className="demand-row">
                                <span>Applications pending</span>
                                <strong style={{ color: 'var(--champagne)' }}>{stats?.pending_applications ?? 0}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Tag Rankings */}
                    <div className="dash-card hover-lift" data-reveal>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <h4>Tag Rankings</h4>
                            <Link href="/leaderboard" style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none' }}>Full Leaderboard →</Link>
                        </div>

                        {(stats?.tag_rankings?.length ?? 0) === 0 ? (
                            <div style={{ fontSize: 13, color: 'var(--text3)', padding: '20px 0', textAlign: 'center' }}>
                                Answer forum questions to earn tag rankings
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {stats.tag_rankings.map(tr => (
                                    <div key={tr.tag_id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 'var(--r)', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--cyan)', flexShrink: 0 }}>
                                            #{tr.rank}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{tr.tag_name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{tr.total_likes} likes</div>
                                        </div>
                                        <Link href={`/forum?tag=${tr.tag_slug}`} style={{ fontSize: 11, color: 'var(--violet-bright)', textDecoration: 'none' }}>
                                            View →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── 5-Pillar Score ─────────────────────────────── */}
                <div className="dash-card hover-lift" style={{ marginBottom: 20 }} data-reveal>
                    <h4 style={{ marginBottom: 16 }}>5-Pillar Score Summary</h4>
                    <div className="pillar-bars">
                        <PillarRow
                            label="Forum Contributions"
                            value={stats?.total_likes ?? 0}
                            max={Math.max(stats?.total_likes ?? 0, 100)}
                            score={stats?.total_likes ?? 0}
                        />
                        <PillarRow
                            label="Quiz Performance"
                            value={stats?.total_quiz_points ?? 0}
                            max={Math.max(stats?.total_quiz_points ?? 0, 100)}
                            score={stats?.total_quiz_points ?? 0}
                        />
                        <PillarRow
                            label="Interview Performance"
                            value={0}
                            max={100}
                            score={0}
                            placeholder="No platform interviews yet"
                        />
                        <PillarRow
                            label="Profile Credibility"
                            value={stats?.rank_score ?? 0}
                            max={Math.max(stats?.rank_score ?? 0, 100)}
                            score={stats?.rank_score ?? 0}
                        />
                        <PillarRow
                            label="Demand Signals"
                            value={(stats?.interests_accepted ?? 0) + (stats?.profile_views ?? 0)}
                            max={Math.max((stats?.interests_accepted ?? 0) + (stats?.profile_views ?? 0), 10)}
                            score={(stats?.interests_accepted ?? 0) * 10 + (stats?.profile_views ?? 0)}
                        />
                    </div>
                </div>

                <FullFooter />
            </div>
        </MainLayout>
    );
}

function PendingHiresCard({ hires }) {
    if (!hires || hires.length === 0) return null;

    return (
        <div className="dash-card hover-lift" data-reveal="fade" style={{ marginBottom: 24, borderColor: 'var(--champagne)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 30 }}>🎉</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 700 }}>
                        {hires.length === 1
                            ? `${hires[0].company} marked you as hired for ${hires[0].role_title}`
                            : `You have ${hires.length} hires to confirm`}
                    </div>
                    <div style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>
                        Confirm to build your verified track record — and optionally help others with anonymous salary data.
                    </div>
                </div>
                <Link href="/hires" className="btn btn-primary btn-sm pop-on-active">Review &amp; confirm →</Link>
            </div>
        </div>
    );
}

function MatchesCard({ matches, openToWork, anonymous }) {
    const [busy, setBusy] = useState(false);
    const color = (s) => (s >= 70 ? 'var(--emerald, #10b981)' : s >= 45 ? 'var(--cyan)' : 'var(--text3)');

    function toggle(url) {
        setBusy(true);
        router.post(url, {}, { preserveScroll: true, onFinish: () => setBusy(false) });
    }

    return (
        <div className="dash-card" data-reveal="fade" style={{ marginBottom: 24 }}>
            <div className="dash-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <h4>🎯 Top job matches for you</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" className={`btn-sm ${anonymous ? 'btn-primary-sm' : 'btn-outline-sm'} pop-on-active`} disabled={busy}
                        title="Hide your name/photo/location from companies until you accept their interest — they evaluate your rank and skills first"
                        onClick={() => toggle('/candidate/anonymous')}>
                        {anonymous ? '🕶 Anonymous' : 'Go anonymous'}
                    </button>
                    <button type="button" className={`btn-sm ${openToWork ? 'btn-primary-sm' : 'btn-outline-sm'} pop-on-active`} disabled={busy} onClick={() => toggle('/candidate/open-to-work')}>
                        {openToWork ? '✓ Open to work' : 'Set open to work'}
                    </button>
                </div>
            </div>
            {anonymous && (
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: -6, marginBottom: 10 }}>
                    🕶 Bias-reduced mode on — companies see your rank &amp; skills, not your identity, until you accept their interest.
                </div>
            )}

            {matches.length > 0 ? (
                <div data-reveal-stagger="55">
                    {matches.map((m) => (
                        <div key={m.slug} className="app-row" data-reveal="fade" style={{ alignItems: 'center' }}>
                            <div style={{ minWidth: 52, textAlign: 'center', fontWeight: 800, fontSize: 18, color: color(m.score) }}>
                                {m.score}%
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600 }}>
                                    <Link href={`/jobs/${m.slug}`} className="link-underline">{m.title}</Link>
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text3)' }}>{m.company} · {m.location || 'Location N/A'} · {m.job_type}</div>
                            </div>
                            <Link href={`/jobs/${m.slug}`} className="btn-sm btn-outline-sm pop-on-active">View</Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="dash-empty">
                    Answer questions in the forum to build your skill profile — then we’ll match you to jobs.
                </div>
            )}
            <div style={{ fontSize: 12, color: 'var(--text4)', marginTop: 10 }}>
                Match blends skill overlap, rank, experience and your preferences. <Link href="/jobs" className="link-underline">Browse all jobs →</Link>
            </div>
        </div>
    );
}

function CredentialCard({ token, userId }) {
    const [busy, setBusy] = useState(false);
    const [copied, setCopied] = useState('');

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const badgeUrl = `${origin}/badge/${token}.svg`;
    const verifyUrl = `${origin}/verify/${token}`;
    const markdown = `[![DevRank](${badgeUrl})](${verifyUrl})`;
    const html = `<a href="${verifyUrl}"><img src="${badgeUrl}" alt="DevRank Verified"></a>`;

    function act(method, url) {
        setBusy(true);
        router[method](url, {}, { preserveScroll: true, onFinish: () => setBusy(false) });
    }

    function copy(text, key) {
        navigator.clipboard?.writeText(text).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(''), 1500);
        });
    }

    if (!token) {
        return (
            <div className="dash-card hover-lift" data-reveal="fade" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 30 }}>🎖️</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 600 }}>Share your verified rank</div>
                    <div style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>
                        Get a signed “DevRank Verified” badge for your GitHub README, LinkedIn or portfolio — it links to a public, auditable page proving how your rank was earned.
                    </div>
                </div>
                <button type="button" className="btn btn-primary btn-sm pop-on-active" disabled={busy} onClick={() => act('post', '/account/credential')}>
                    {busy ? 'Generating…' : 'Generate badge'}
                </button>
            </div>
        );
    }

    return (
        <div className="dash-card" data-reveal="fade" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
                <div style={{ fontSize: 24 }}>🎖️</div>
                <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontWeight: 600 }}>Your verified rank badge</div>
                    <div style={{ color: 'var(--text3)', fontSize: 13 }}>Embed it anywhere — it always shows your live rank.</div>
                </div>
                <a href={verifyUrl} target="_blank" rel="noopener" className="btn-sm btn-outline-sm pop-on-active">View public page ↗</a>
            </div>

            <div style={{ marginBottom: 14 }}>
                <img src={badgeUrl} alt="DevRank Verified badge" style={{ height: 28 }} />
            </div>

            {[
                { key: 'md', label: 'Markdown (README)', value: markdown },
                { key: 'html', label: 'HTML', value: html },
                { key: 'url', label: 'Link (LinkedIn / résumé)', value: verifyUrl },
            ].map((row) => (
                <div key={row.key} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{row.label}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                        <code style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: 'var(--bg2, #0f172a)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 12 }}>
                            {row.value}
                        </code>
                        <button type="button" className="btn-sm btn-outline-sm pop-on-active" onClick={() => copy(row.value, row.key)}>
                            {copied === row.key ? 'Copied ✓' : 'Copy'}
                        </button>
                    </div>
                </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <button type="button" className="btn-sm btn-ghost" disabled={busy} onClick={() => act('post', '/account/credential/rotate')}>
                    Rotate link
                </button>
                <button type="button" className="btn-sm btn-ghost" disabled={busy} style={{ color: 'var(--rose, #ef4444)' }}
                    onClick={() => { if (confirm('Revoke your badge? All existing embeds will stop working.')) act('delete', '/account/credential'); }}>
                    Revoke
                </button>
            </div>
        </div>
    );
}

function StatCard({ label, value, sub, color }) {
    return (
        <div className="dash-card hover-lift" style={{ textAlign: 'center' }} data-reveal>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: 8 }}>
                {label}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: color ?? 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>{sub}</div>
        </div>
    );
}

function PillarRow({ label, value, max, score, placeholder }) {
    const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
    return (
        <div className="pillar-row">
            <span className="pillar-label">{label}</span>
            <div className="pillar-bar">
                <div className="pillar-fill bar-grow" data-reveal="none" style={{ '--bar-w': `${pct}%` }} />
            </div>
            <span className="pillar-score" style={{ color: pct === 0 ? 'var(--text4)' : undefined }}>
                {placeholder ?? score.toLocaleString()}
            </span>
        </div>
    );
}
