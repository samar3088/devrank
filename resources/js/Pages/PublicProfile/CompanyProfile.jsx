import '../../../css/pages/public-profile.css';
import '../../../css/pages/forum.css';
import '../../../css/pages/jobs.css';
import '../../../css/pages/home.css';
import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

export default function CompanyProfile() {
    const { company, active_jobs, total_jobs_posted } = usePage().props;

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    function formatSalary(min, max, currency) {
        if (!min && !max) return null;
        if (currency === 'INR') {
            if (min && max) return `₹${(min / 100000).toFixed(0)}–${(max / 100000).toFixed(0)} LPA`;
            if (min) return `₹${(min / 100000).toFixed(0)}L+`;
        }
        return null;
    }

    const trustScore = company.trust_score || 0;
    const stars = '★'.repeat(Math.round(trustScore / 20));

    return (
        <MainLayout>
            <Head title={`${company.company_name} — DevRank`} />
            <div className="profile-container">
                <div className="breadcrumb" style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '20px' }}>
                    <Link href="/jobs" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Jobs</Link> › Company Profile
                </div>

                <div className="profile-layout">
                    <div>
                        {/* Company Hero */}
                        <div className="profile-hero">
                            <div className="profile-header">
                                <div className="company-logo-lg">{getInitials(company.company_name)}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                                        <div className="profile-name">{company.company_name}</div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button className="btn-sm btn-primary-sm">View Open Jobs</button>
                                            <button className="btn-sm btn-outline-sm">Follow</button>
                                        </div>
                                    </div>
                                    <div style={{ color: 'var(--text2)', fontSize: '15px', marginBottom: '12px' }}>
                                        {company.industry || 'Technology'} · {company.location || 'India'} · {company.company_size || '—'} employees
                                    </div>
                                    <div className="profile-badges">
                                        {trustScore >= 80 && <span className="badge badge-amber">🏅 Transparent Employer</span>}
                                        {trustScore >= 70 && <span className="badge badge-cyan">✅ Trusted Hirer</span>}
                                        {trustScore >= 60 && <span className="badge badge-cyan">⚡ Fast Responder</span>}
                                        {trustScore >= 50 && <span className="badge badge-green">❤️ Candidate Friendly</span>}
                                    </div>
                                    {company.company_description && <p className="profile-bio">{company.company_description}</p>}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="company-quick-stats">
                                <div className="company-quick-stat">
                                    <div className="company-quick-stat-value" style={{ color: 'var(--cyan)' }}>{trustScore}</div>
                                    <div className="company-quick-stat-label">Trust Score</div>
                                </div>
                                <div className="company-quick-stat">
                                    <div className="company-quick-stat-value" style={{ color: 'var(--emerald)' }}>0</div>
                                    <div className="company-quick-stat-label">Platform Hires</div>
                                </div>
                                <div className="company-quick-stat">
                                    <div className="company-quick-stat-value">{stars.length}</div>
                                    <div className="company-quick-stat-label">Avg Rating</div>
                                </div>
                                <div className="company-quick-stat">
                                    <div className="company-quick-stat-value" style={{ color: 'var(--champagne)' }}>{active_jobs?.length || 0}</div>
                                    <div className="company-quick-stat-label">Open Jobs</div>
                                </div>
                            </div>
                        </div>

                        {/* Open Jobs */}
                        <h3 style={{ marginBottom: '16px' }}>Open Jobs ({active_jobs?.length || 0})</h3>
                        {active_jobs?.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
                                No open jobs at the moment.
                            </div>
                        ) : (
                            active_jobs.map(job => (
                                <div key={job.id} className="pub-job-card">
                                    <div>
                                        <Link href={`/jobs/${job.slug}`} className="pub-job-title">{job.title}</Link>
                                        <div className="pub-job-meta">
                                            <span>📍 {job.location || job.work_mode}</span>
                                            <span>⏱ {job.job_type}</span>
                                            {job.experience_range && <span>🧑‍💼 {job.experience_range}</span>}
                                        </div>
                                        {job.tags?.length > 0 && (
                                            <div className="tags">
                                                {job.tags.map(tag => (
                                                    <span key={tag.id} className="tag">{tag.name}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="pub-job-actions">
                                        {formatSalary(job.salary_min, job.salary_max, job.salary_currency) && (
                                            <div className="pub-job-salary">{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</div>
                                        )}
                                        <Link href={`/jobs/${job.slug}`} className="btn-sm btn-primary-sm">View Job</Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Sidebar */}
                    <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)' }}>
                        <div className="profile-sidebar-card" style={{ textAlign: 'center' }}>
                            <div className="profile-rank-big">{trustScore}</div>
                            <div className="profile-rank-label">Trust Score / 100</div>
                            <hr className="profile-divider" />
                            <div className="pillar-bars">
                                <div className="pillar-row"><span className="pillar-label">Hiring Process</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '78%' }}></div></div><span className="pillar-score">78</span></div>
                                <div className="pillar-row"><span className="pillar-label">Candidate Exp.</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '86%' }}></div></div><span className="pillar-score">86</span></div>
                                <div className="pillar-row"><span className="pillar-label">Engagement</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '68%' }}></div></div><span className="pillar-score">68</span></div>
                                <div className="pillar-row"><span className="pillar-label">Outcomes</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '90%' }}></div></div><span className="pillar-score">90</span></div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                                {trustScore >= 80 && <span className="badge badge-amber">🏅 Transparent</span>}
                                {trustScore >= 70 && <span className="badge badge-cyan">✅ Trusted</span>}
                            </div>
                        </div>

                        <div className="profile-sidebar-card">
                            <h4 style={{ marginBottom: '14px' }}>Quick Actions</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {company.company_website && (
                                    <a href={company.company_website} target="_blank" className="btn-sm btn-outline-sm" style={{ justifyContent: 'flex-start' }}>🌐 Visit Website</a>
                                )}
                                <button className="btn-sm btn-outline-sm" style={{ justifyContent: 'flex-start' }}>📧 Contact Company</button>
                            </div>
                        </div>
                    </div>
                </div>
                <FullFooter />
            </div>
        </MainLayout>
    );
}