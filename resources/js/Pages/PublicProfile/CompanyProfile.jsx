import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';
import CountUp from '@/Components/CountUp';

export default function CompanyProfile() {
    const { company, active_jobs, jobs_count, total_jobs_posted, verified_hires, response_rate } = usePage().props;
    const [activeTab, setActiveTab] = useState('trust');

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

    return (
        <MainLayout>
            <Head title={company.company_name} />
            <div className="profile-container">
                <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '20px' }}>
                    <Link href="/jobs" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Jobs</Link> › Company Profile
                </div>

                <div className="profile-layout">
                    <div data-reveal-stagger="80">
                        {/* Company Hero */}
                        <div className="profile-hero" data-reveal>
                            <div className="profile-header" style={{ alignItems: 'flex-start' }}>
                                <div className="company-logo-lg">{getInitials(company.company_name)}</div>
                                <div style={{ flex: 1 }}>
                                    {/* Name */}
                                    <h2 style={{ marginTop: 0, marginBottom: '4px', fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15 }}>{company.company_name}</h2>
                                    {/* Subtitle */}
                                    <div style={{ color: 'var(--text3)', fontSize: '15px', marginBottom: '12px' }}>
                                        {company.industry || 'Technology'} · {company.location || 'India'} · {company.company_size || '—'} employees
                                    </div>
                                    {/* Buttons */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                        <button className="profile-btn-primary">View Open Jobs</button>
                                        <button className="profile-btn-outline">Follow</button>
                                    </div>
                                    {/* Row 3: Badges */}
                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                                        {trustScore >= 80 && <span className="badge badge-amber">🏅 Transparent Employer</span>}
                                        {trustScore >= 70 && <span className="badge badge-cyan">✅ Trusted Hirer</span>}
                                        {trustScore >= 60 && <span className="badge badge-cyan">⚡ Fast Responder</span>}
                                        {trustScore >= 50 && <span className="badge badge-green">❤️ Candidate Friendly</span>}
                                    </div>
                                    {/* Row 4: Description */}
                                    <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.7', maxWidth: '600px', margin: 0 }}>
                                        {company.company_description || 'A technology company hiring through DevRank.'}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Stats — real signals only (4 columns) */}
                            <div className="company-quick-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                <div className="company-quick-stat">
                                    <div className="company-quick-stat-value" style={{ color: 'var(--cyan)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}><CountUp end={trustScore} /></div>
                                    <div className="company-quick-stat-label">Trust Score</div>
                                </div>
                                <div className="company-quick-stat">
                                    <div className="company-quick-stat-value" style={{ color: 'var(--emerald)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}><CountUp end={verified_hires || 0} /></div>
                                    <div className="company-quick-stat-label">Verified Hires</div>
                                </div>
                                <div className="company-quick-stat">
                                    <div className="company-quick-stat-value" style={{ color: 'var(--champagne)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}><CountUp end={active_jobs?.length || 0} /></div>
                                    <div className="company-quick-stat-label">Open Jobs</div>
                                </div>
                                <div className="company-quick-stat">
                                    <div className="company-quick-stat-value" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>
                                        {response_rate === null || response_rate === undefined
                                            ? <span style={{ color: 'var(--text3)' }}>—</span>
                                            : <CountUp end={response_rate} suffix="%" />}
                                    </div>
                                    <div className="company-quick-stat-label">Response Rate</div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="profile-tabs" data-reveal="fade">
                            <button className={`profile-tab ${activeTab === 'trust' ? 'active' : ''}`} onClick={() => setActiveTab('trust')}>🏆 Trust Score</button>
                            <button className={`profile-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>⭐ Reviews (28)</button>
                            <button className={`profile-tab ${activeTab === 'interviews' ? 'active' : ''}`} onClick={() => setActiveTab('interviews')}>🎯 Interviews (42)</button>
                            <button className={`profile-tab ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>💼 Open Jobs</button>
                            <button className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>ℹ️ About</button>
                        </div>

                        {/* Trust Score Tab — real signals only */}
                        {activeTab === 'trust' && (
                            <div data-reveal>
                                <div className="dash-card" style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h4>Company Trust Score</h4>
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--cyan)' }}><CountUp end={trustScore} /><span style={{ fontSize: '1rem', color: 'var(--text3)' }}>/100</span></div>
                                    </div>
                                    <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.8, marginBottom: '20px' }}>
                                        Recalculated from verified platform data — it can’t be purchased or manipulated. The score blends two
                                        signals: <strong>interview-board ghosting rate</strong> (from candidate reviews) and{' '}
                                        <strong>application-response conduct</strong> (leaving applicants unanswered past the response SLA lowers it).
                                        Honest, timely rejections never hurt it — only ghosting and silence do.
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                                        <div className="dash-card" style={{ margin: 0, textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald)' }}><CountUp end={verified_hires || 0} /></div>
                                            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Verified hires</div>
                                        </div>
                                        <div className="dash-card" style={{ margin: 0, textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                                                {response_rate === null || response_rate === undefined ? '—' : <><CountUp end={response_rate} />%</>}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Applicant response rate</div>
                                        </div>
                                        <div className="dash-card" style={{ margin: 0, textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--champagne)' }}><CountUp end={active_jobs?.length || 0} /></div>
                                            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Open roles</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div className="dash-card">
                                <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>No reviews yet. Reviews appear after candidates complete the interview process.</p>
                            </div>
                        )}

                        {/* Interviews Tab */}
                        {activeTab === 'interviews' && (
                            <div className="dash-card">
                                <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>No interview experiences shared yet.</p>
                            </div>
                        )}

                        {/* Open Jobs Tab */}
                        {activeTab === 'jobs' && (
                            <div data-reveal-stagger="70">
                                {active_jobs?.length === 0 ? (
                                    <div className="dash-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                                        No open jobs at the moment.
                                    </div>
                                ) : (
                                    active_jobs.map(job => (
                                        <div key={job.id} className="pub-job-card hover-lift" data-reveal>
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
                                                <Link href={`/jobs/${job.slug}`} className="btn-sm btn-primary-sm">Apply</Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* About Tab */}
                        {activeTab === 'about' && (
                            <div className="dash-card">
                                <h4 style={{ marginBottom: '14px' }}>About {company.company_name}</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <AboutField label="Size" value={company.company_size ? `${company.company_size} employees` : '—'} />
                                    <AboutField label="Industry" value={company.industry || '—'} />
                                    <AboutField label="Headquarters" value={company.location || '—'} />
                                    <AboutField label="Website" value={company.company_website} isLink />
                                </div>
                                <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.8' }}>
                                    {company.company_description || 'No description provided.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)' }}>
                        {/* Trust Score Card */}
                        <div className="profile-sidebar-card" data-reveal="right" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '4px' }}><CountUp end={trustScore} /></div>
                            <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Trust Score / 100</div>
                            <hr className="profile-divider" />
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {trustScore >= 80 && <span className="badge badge-amber">🏅 Transparent</span>}
                                {trustScore >= 60 && <span className="badge badge-cyan">⚡ Fast</span>}
                                {trustScore >= 70 && <span className="badge badge-green">✅ Trusted</span>}
                                {trustScore >= 50 && <span className="badge badge-green">❤️ Friendly</span>}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="profile-sidebar-card">
                            <h4 style={{ marginBottom: '12px' }}>Quick Actions</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <Link href="/jobs" className="profile-btn-primary" style={{ justifyContent: 'center' }}>View {active_jobs?.length || 0} Open Jobs</Link>
                                <Link href="/interviews" className="profile-btn-outline" style={{ justifyContent: 'center' }}>Read Interview Reviews</Link>
                                <button className="profile-btn-outline" style={{ justifyContent: 'center', background: 'transparent', border: 'none', color: 'var(--text3)' }}>Follow Company</button>
                            </div>
                        </div>

                        {/* Hiring Activity — real signals */}
                        <div className="profile-sidebar-card">
                            <h4 style={{ marginBottom: '12px' }}>Hiring Activity</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Verified hires</span><strong style={{ color: 'var(--emerald)' }}>{verified_hires || 0}</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Applicant response rate</span><strong style={{ color: response_rate >= 80 ? 'var(--emerald)' : undefined }}>{response_rate === null || response_rate === undefined ? '—' : `${response_rate}%`}</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Open roles</span><strong>{active_jobs?.length || 0}</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Jobs posted</span><strong>{jobs_count ?? active_jobs?.length ?? 0}</strong></div>
                                {company.created_at && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Platform since</span><strong>{new Date(company.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</strong></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <FullFooter />
            </div>
        </MainLayout>
    );
}

function AboutField({ label, value, isLink }) {
    return (
        <div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px' }}>{label}</div>
            {isLink && value ? (
                <a href={value} target="_blank" style={{ fontWeight: 600, color: 'var(--cyan)' }}>{value.replace('https://', '')}</a>
            ) : (
                <div style={{ fontWeight: 600 }}>{value || '—'}</div>
            )}
        </div>
    );
}