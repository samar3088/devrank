import { Head, usePage, Link } from '@inertiajs/react';
import CompanyLayout from '@/Layouts/CompanyLayout';

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
            <div className="stats-grid-4">
                <div className="stat-card">
                    <div className="stat-label">Active Job Posts</div>
                    <div className="stat-value">{stats?.active_jobs || 0}</div>
                    {stats?.expiring_jobs > 0 && (
                        <div className="stat-change stat-change-warn">{stats.expiring_jobs} expiring in &lt;7 days</div>
                    )}
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Applicants</div>
                    <div className="stat-value">{stats?.total_applicants || 0}</div>
                    <div className="stat-change stat-change-up">↑ this week</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Trust Score</div>
                    <div className="stat-value" style={{ color: 'var(--champagne)' }}>
                        82<span style={{ fontSize: '1rem', color: 'var(--text3)' }}>/100</span>
                    </div>
                    <div className="stat-change stat-change-up">↑ +3 this month</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Outreach Sent</div>
                    <div className="stat-value">{stats?.outreach_sent || 0}</div>
                    <div className="stat-change">
                        {stats?.outreach_accepted || 0} accepted · {stats?.outreach_pending || 0} pending
                    </div>
                </div>
            </div>

            {/* Alerts */}
            <div className="dash-alert dash-alert-warn">
                <span>⚠️</span>
                <div><strong>Feedback required:</strong> Rejected candidates are awaiting rejection reasons. Provide feedback to maintain your Transparent Employer badge and Trust Score.</div>
            </div>
            <div className="dash-alert dash-alert-info" style={{ marginBottom: '28px' }}>
                <span>💡</span>
                <div><strong>Tip:</strong> Your response rate is 68% — platform average is 82%. Respond to pending messages to improve your Trust Score.</div>
            </div>

            {/* Pipeline + Trust Score */}
            <div className="dash-grid-2">
                <div className="dash-card">
                    <div className="dash-card-header">
                        <h4>Applicant Pipeline</h4>
                    </div>
                    <div className="pipeline-bars">
                        <PipelineRow label="Applied" count={stats?.total_applicants || 87} max={87} fillClass="pipeline-fill-applied" />
                        <PipelineRow label="Reviewed" count={45} max={87} fillClass="pipeline-fill-reviewed" />
                        <PipelineRow label="Interviewing" count={18} max={87} fillClass="pipeline-fill-interview" />
                        <PipelineRow label="Offered" count={5} max={87} fillClass="pipeline-fill-offered" />
                        <PipelineRow label="Rejected" count={19} max={87} fillClass="pipeline-fill-rejected" />
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-header">
                        <h4>Trust Score Breakdown</h4>
                        <a href="#">Full report →</a>
                    </div>
                    <div className="trust-big">82</div>
                    <div className="trust-sub">Out of 100 · Updated weekly</div>
                    <div className="pillar-bars">
                        <div className="pillar-row"><span className="pillar-label">Hiring Process</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '78%' }}></div></div><span className="pillar-score">78</span></div>
                        <div className="pillar-row"><span className="pillar-label">Candidate Exp.</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '86%' }}></div></div><span className="pillar-score">86</span></div>
                        <div className="pillar-row"><span className="pillar-label">Platform Engage.</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '68%' }}></div></div><span className="pillar-score">68</span></div>
                        <div className="pillar-row"><span className="pillar-label">Hiring Outcomes</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '90%' }}></div></div><span className="pillar-score">90</span></div>
                    </div>
                </div>
            </div>

            {/* Recent Applicants */}
            <div className="dash-card">
                <div className="dash-card-header">
                    <h4>Recent Applicants</h4>
                    <a href="#">View all →</a>
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
                                <Link href="#" className="btn-sm btn-outline-sm">Review</Link>
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
                <div className={`pipeline-fill ${fillClass}`} style={{ width: `${width}%` }}></div>
            </div>
            <span className="pipeline-score">{count}</span>
        </div>
    );
}
