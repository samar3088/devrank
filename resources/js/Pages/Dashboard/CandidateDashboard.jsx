import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

export default function CandidateDashboard() {
    const { stats, auth } = usePage().props;
    const user = auth?.user;

    // Weekly rank chart — from DashboardService.getWeeklyRankHistory()
    const history  = stats?.weekly_history ?? [];
    const maxScore = history.length ? Math.max(...history.map(h => h.score), 1) : 1;

    return (
        <MainLayout>
            <Head title="Dashboard — DevRank" />
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

                {/* ── Top Stats Row ──────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                    <StatCard
                        label="Rank Score"
                        value={stats?.rank_score?.toLocaleString() ?? 0}
                        sub={`#${stats?.rank_position ?? '—'} globally`}
                        color="var(--cyan)"
                    />
                    <StatCard
                        label="Human Score"
                        value={`${stats?.human_score ?? 0}%`}
                        sub="AI integrity check"
                        color="var(--emerald)"
                    />
                    <StatCard
                        label="Forum Answers"
                        value={stats?.total_replies ?? 0}
                        sub={`${stats?.total_likes ?? 0} likes received`}
                        color="var(--violet-bright)"
                    />
                    <StatCard
                        label="Quizzes Passed"
                        value={stats?.quizzes_passed ?? 0}
                        sub={`of ${stats?.quiz_attempts ?? 0} attempted`}
                        color="var(--champagne)"
                    />
                </div>

                {/* ── Rank Chart + Pending Actions ──────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

                    {/* Rank chart */}
                    <div className="dash-card">
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
                    <div className="dash-card">
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
                            📝 Leave an <strong>interview review</strong> to help others and earn +15 pts
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
                    <div className="dash-card">
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
                    <div className="dash-card">
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
                <div className="dash-card" style={{ marginBottom: 20 }}>
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

function StatCard({ label, value, sub, color }) {
    return (
        <div className="dash-card" style={{ textAlign: 'center' }}>
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
                <div className="pillar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="pillar-score" style={{ color: pct === 0 ? 'var(--text4)' : undefined }}>
                {placeholder ?? score.toLocaleString()}
            </span>
        </div>
    );
}
