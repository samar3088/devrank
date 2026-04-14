import '../../../css/pages/dashboard-candidate.css';
import '../../../css/pages/dashboard-company.css';
import { Head, usePage, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function CandidateDashboard() {
    const { auth, stats } = usePage().props;
    const user = auth?.user;

    const barHeights = [30, 40, 35, 55, 48, 62, 70, 78, 85, 80, 92, 100];

    return (
        <MainLayout>
            <Head title="My Dashboard" />
            <div className="candidate-page">
                {/* Header */}
                <div className="dash-header">
                    <div className="dash-header-left">
                        <h1 style={{ fontSize: '1.75rem' }}>Good morning, {user?.name?.split(' ')[0]} 👋</h1>
                        <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
                            Your rank score is <strong style={{ color: 'var(--cyan)' }}>{stats?.total_rank_score?.toLocaleString() || 0}</strong> · {stats?.monthly_apps_remaining} job applications left this month
                        </p>
                    </div>
                    <div className="dash-header-actions">
                        <Link href="/profile" className="btn-sm btn-outline-sm">View Public Profile</Link>
                        <Link href="/forum/create" className="btn-sm btn-outline-sm">+ New Topic</Link>
                        <Link href="/quizzes" className="btn-sm btn-primary-sm">+ Take a Quiz</Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="stats-grid-4">
                    <div className="stat-card">
                        <div className="stat-label">Global Rank</div>
                        <div className="stat-value">#1</div>
                        <div className="stat-change stat-change-up">↑ 3 places this week</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total Score</div>
                        <div className="stat-value">{stats?.total_rank_score?.toLocaleString() || 0}</div>
                        <div className="stat-change stat-change-up">↑ +180 this week</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Human Score</div>
                        <div className="stat-value">
                            {stats?.human_score || 0}<span style={{ fontSize: '1rem' }}>%</span>
                        </div>
                        <div className="stat-change">Above platform avg</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Outreach Received</div>
                        <div className="stat-value">{stats?.interest_requests || 0}</div>
                        <div className="stat-change">{stats?.pending_outreach || 0} pending response</div>
                    </div>
                </div>

                {/* Sidebar + Content */}
                <div className="dash-layout">
                    {/* Sidebar */}
                    <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)' }}>
                        <div className="cand-sidebar-card">
                            <nav className="cand-nav">
                                <a href="#" className="cand-nav-link active"><span>📊</span> Overview</a>
                                <a href="#" className="cand-nav-link">
                                    <span>💼</span> Applications
                                    {stats?.applications_count > 0 && (
                                        <span className="cand-nav-badge cand-nav-badge-cyan">{stats.applications_count}</span>
                                    )}
                                </a>
                                <a href="#" className="cand-nav-link"><span>🏆</span> My Rank</a>
                                <a href="#" className="cand-nav-link">
                                    <span>📨</span> Outreach
                                    {stats?.pending_outreach > 0 && (
                                        <span className="cand-nav-badge cand-nav-badge-amber">{stats.pending_outreach}</span>
                                    )}
                                </a>
                                <a href="#" className="cand-nav-link"><span>📝</span> Rejection Log</a>
                                <a href="#" className="cand-nav-link"><span>📈</span> Self-Improve</a>
                                <a href="#" className="cand-nav-link"><span>⚙️</span> Settings</a>
                            </nav>
                        </div>

                        {/* This Month Card */}
                        <div className="cand-sidebar-card">
                            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: '10px' }}>This Month</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text2)' }}>
                                <div className="month-stat-row">
                                    <span>Jobs Applied</span>
                                    <strong>{stats?.applications_count || 0}/5</strong>
                                </div>
                                <div className="month-progress">
                                    <div className="month-progress-fill" style={{ width: `${((stats?.applications_count || 0) / 5) * 100}%` }}></div>
                                </div>
                                <div className="month-stat-row">
                                    <span>Forum Answers</span>
                                    <strong>{stats?.replies_count || 0}</strong>
                                </div>
                                <div className="month-stat-row">
                                    <span>Likes Received</span>
                                    <strong style={{ color: 'var(--cyan)' }}>+{stats?.likes_received || 0}</strong>
                                </div>
                                <div className="month-stat-row">
                                    <span>Topics Created</span>
                                    <strong>{stats?.topics_count || 0}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div>
                        {/* Rank Progress Chart */}
                        <div className="dash-card" style={{ marginBottom: '20px' }}>
                            <div className="dash-card-header">
                                <h4>Rank Progress — Last 30 Days</h4>
                                <span className="badge badge-green">↑ +180 pts</span>
                            </div>
                            <div className="rank-chart">
                                {barHeights.map((h, i) => (
                                    <div
                                        key={i}
                                        className={`rank-bar ${i === barHeights.length - 1 ? 'current' : ''}`}
                                        style={{ height: `${h}%` }}
                                    ></div>
                                ))}
                            </div>
                            <div className="rank-chart-labels">
                                <span>Mar 3</span><span>Mar 10</span><span>Mar 17</span><span>Mar 24</span><span>Apr 3</span>
                            </div>
                        </div>

                        {/* Pending Actions + Demand Signals */}
                        <div className="dash-grid-2" style={{ marginBottom: '20px' }}>
                            <div className="dash-card">
                                <h4 style={{ marginBottom: '12px' }}>Pending Actions</h4>
                                <div className="nudge-card">📨 <strong>{stats?.pending_outreach || 0} company outreach messages</strong> waiting for your response</div>
                                <div className="nudge-card">🏅 You haven't taken the <strong>System Design quiz</strong> yet — could boost your rank significantly</div>
                                <div className="nudge-card">📝 Leave an <strong>interview review</strong> to help others and earn +15 pts</div>
                            </div>
                            <div className="dash-card">
                                <h4 style={{ marginBottom: '12px' }}>Demand Signals</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text2)' }}>
                                    <div className="demand-row"><span>Profile views this week</span><strong style={{ color: 'var(--cyan)' }}>24</strong></div>
                                    <div className="demand-row"><span>Companies who saved you</span><strong style={{ color: 'var(--cyan)' }}>8</strong></div>
                                    <div className="demand-row"><span>Outreach received (total)</span><strong>{stats?.interest_requests || 0}</strong></div>
                                    <div className="demand-row"><span>Likes on your answers</span><strong>{stats?.likes_received || 0}</strong></div>
                                    <div className="demand-row"><span>Forum contributions</span><strong style={{ color: 'var(--emerald)' }}>{stats?.replies_count || 0}</strong></div>
                                </div>
                            </div>
                        </div>

                        {/* 5-Pillar Score */}
                        <div className="dash-card">
                            <h4 style={{ marginBottom: '14px' }}>5-Pillar Score Summary</h4>
                            <div className="pillar-bars">
                                <div className="pillar-row"><span className="pillar-label">Forum Contributions</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '92%' }}></div></div><span className="pillar-score">1,240</span></div>
                                <div className="pillar-row"><span className="pillar-label">Quiz Performance</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '85%' }}></div></div><span className="pillar-score">980</span></div>
                                <div className="pillar-row"><span className="pillar-label">Interview Performance</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '98%' }}></div></div><span className="pillar-score">1,450</span></div>
                                <div className="pillar-row"><span className="pillar-label">Profile Credibility</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '72%' }}></div></div><span className="pillar-score">620</span></div>
                                <div className="pillar-row"><span className="pillar-label">Demand Signals</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '68%' }}></div></div><span className="pillar-score">530</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}