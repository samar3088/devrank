import { Head, usePage, Link } from '@inertiajs/react';
import CompanyLayout from '@/Layouts/CompanyLayout';
import CountUp from '@/Components/CountUp';

export default function CompanyDashboard() {
    const { auth, stats } = usePage().props;

    const header = (
        <div className="dash-header">
            <div className="dash-header-left">
                <h1 style={{ fontSize: '2rem' }}>Company Dashboard</h1>
                <p>{auth.user.company_name || auth.user.name} · Last updated just now</p>
            </div>
            <div className="dash-header-actions">
                <Link href="/company/profile" className="btn-sm btn-outline-sm">View Public Profile</Link>
                <Link href="/company/jobs/create" className="btn-sm btn-primary-sm">+ Post New Job</Link>
            </div>
        </div>
    );

    return (
        <CompanyLayout fullWidthHeader={header}>
            <Head title="Company Dashboard" />

            {/* Stat Cards */}
            <div className="stats-grid-4" data-reveal-stagger="80">
                <div className="stat-card hover-lift" data-reveal>
                    <div className="stat-label">Active Job Posts</div>
                    <div className="stat-value"><CountUp end={stats?.active_jobs || 0} /></div>
                    {stats?.expiring_jobs > 0 && (
                        <div className="stat-change stat-change-warn">{stats.expiring_jobs} expiring in &lt;7 days</div>
                    )}
                </div>
                <div className="stat-card hover-lift" data-reveal>
                    <div className="stat-label">Total Applicants</div>
                    <div className="stat-value"><CountUp end={stats?.total_applicants || 0} /></div>
                    <div className="stat-change stat-change-up">↑ this week</div>
                </div>
                <div className="stat-card hover-lift" data-reveal>
                    <div className="stat-label">Trust Score</div>
                    <div className="stat-value" style={{ color: 'var(--champagne)' }}>
                        <CountUp end={stats?.trust_score || 0} /><span style={{ fontSize: '1rem', color: 'var(--text3)' }}>/100</span>
                    </div>
                    <div className="stat-change">ghosting + response conduct</div>
                </div>
                <div className="stat-card hover-lift" data-reveal>
                    <div className="stat-label">Outreach Sent</div>
                    <div className="stat-value"><CountUp end={stats?.outreach_sent || 0} /></div>
                    <div className="stat-change">
                        {stats?.outreach_accepted || 0} accepted · {stats?.outreach_pending || 0} pending
                    </div>
                </div>
            </div>

            {/* Alerts — conditional & real */}
            {stats?.expiring_jobs > 0 && (
                <div className="dash-alert dash-alert-warn" data-reveal>
                    <span>⚠️</span>
                    <div><strong>{stats.expiring_jobs} job{stats.expiring_jobs > 1 ? 's' : ''} expiring within 7 days.</strong> Renew or repost to keep them visible on the job board.</div>
                </div>
            )}
            <div className="dash-alert dash-alert-info" style={{ marginBottom: '28px' }} data-reveal>
                <span>💡</span>
                <div>
                    <strong>{stats?.monthly_posts_remaining ?? 0} job post{(stats?.monthly_posts_remaining ?? 0) === 1 ? '' : 's'} and {stats?.monthly_interest_remaining ?? 0} outreach message{(stats?.monthly_interest_remaining ?? 0) === 1 ? '' : 's'} left this month.</strong> Your Trust Score reflects how you treat candidates — respond promptly and always give a rejection reason.
                </div>
            </div>

            {/* Pipeline + Trust Score */}
            <div className="dash-grid-2">
                <div className="dash-card hover-lift" data-reveal>
                    <div className="dash-card-header">
                        <h4>Applicant Pipeline</h4>
                        <span style={{ fontSize: 13, color: 'var(--text3)' }}>{stats?.total_applicants || 0} total</span>
                    </div>
                    <div className="pipeline-bars">
                        {(() => {
                            const p = stats?.pipeline || {};
                            const rows = [
                                ['Applied', p.applied || 0, 'pipeline-fill-applied'],
                                ['Reviewing', p.reviewing || 0, 'pipeline-fill-reviewed'],
                                ['Shortlisted', p.shortlisted || 0, 'pipeline-fill-reviewed'],
                                ['Interview', p.interview || 0, 'pipeline-fill-interview'],
                                ['Offered', p.offered || 0, 'pipeline-fill-offered'],
                                ['Hired', p.hired || 0, 'pipeline-fill-offered'],
                                ['Rejected', p.rejected || 0, 'pipeline-fill-rejected'],
                            ];
                            const max = Math.max(1, ...rows.map(r => r[1]));
                            return rows.map(([label, count, cls]) => (
                                <PipelineRow key={label} label={label} count={count} max={max} fillClass={cls} />
                            ));
                        })()}
                    </div>
                </div>

                <div className="dash-card hover-lift" data-reveal>
                    <div className="dash-card-header">
                        <h4>Trust Score</h4>
                        <Link href={`/company/${auth.user.id}`}>Public profile →</Link>
                    </div>
                    <div className="trust-big" style={{ color: 'var(--champagne)' }}><CountUp end={stats?.trust_score || 0} /></div>
                    <div className="trust-sub">Out of 100 · Based on your hiring conduct</div>
                    <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginTop: 16 }}>
                        Your Trust Score reflects how you treat candidates — it blends your <strong>interview-ghosting rate</strong> (from candidate reviews) with your <strong>application-response conduct</strong> (leaving applicants unanswered past the response SLA lowers it). Honest, timely rejections never hurt it — only ghosting and silence do.
                    </p>
                    <div style={{ display: 'flex', gap: 28, marginTop: 20 }}>
                        <div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--emerald)' }}><CountUp end={stats?.verified_hires || 0} /></div><div style={{ fontSize: 12, color: 'var(--text3)' }}>Verified hires</div></div>
                        <div><div style={{ fontSize: 22, fontWeight: 700 }}><CountUp end={stats?.outreach_accepted || 0} /></div><div style={{ fontSize: 12, color: 'var(--text3)' }}>Outreach accepted</div></div>
                        <div><div style={{ fontSize: 22, fontWeight: 700 }}><CountUp end={stats?.outreach_pending || 0} /></div><div style={{ fontSize: 12, color: 'var(--text3)' }}>Awaiting reply</div></div>
                    </div>
                </div>
            </div>

            {/* Recent Applicants */}
            <div className="dash-card hover-lift" data-reveal>
                <div className="dash-card-header">
                    <h4>Recent Applicants</h4>
                    <Link href="/company/jobs">View all jobs →</Link>
                </div>
                {stats?.recent_applicants?.length > 0 ? (
                    stats.recent_applicants.map(app => (
                        <div key={app.id} className="app-row">
                            <div className="app-rank-badge">#{app.candidate_score > 0 ? Math.ceil(app.candidate_score / 500) : '—'}</div>
                            <div className="app-avatar">{app.candidate_initials}</div>
                            <div className="app-info">
                                <div className="app-name">{app.candidate_name}</div>
                                <div className="app-meta">Applied for: {app.job_title} · {app.applied_at}</div>
                            </div>
                            <div className="app-right">
                                <span className="app-score">{app.candidate_score.toLocaleString()} pts</span>
                                <span className={`app-status app-status-${app.status}`}>{app.status}</span>
                                <Link href={`/company/jobs/${app.job_id}/applicants`} className="btn-sm btn-outline-sm pop-on-active">Review</Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="dash-empty">
                        No applicants yet. Post a job to start receiving applications.
                    </div>
                )}
            </div>
        </CompanyLayout>
    );
}

function PipelineRow({ label, count, max, fillClass }) {
    const width = max > 0 ? (count / max) * 100 : 0;
    return (
        <div className="pipeline-row">
            <span className="pipeline-label">{label}</span>
            <div className="pipeline-bar">
                <div className={`pipeline-fill ${fillClass} bar-grow`} data-reveal="none" style={{ '--bar-w': `${width}%` }}></div>
            </div>
            <span className="pipeline-score">{count}</span>
        </div>
    );
}
