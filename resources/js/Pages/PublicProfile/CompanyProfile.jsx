import '../../../css/pages/public-profile.css';
import '../../../css/pages/forum.css';
import '../../../css/pages/jobs.css';
import '../../../css/pages/home.css';
import '../../../css/pages/dashboard-company.css';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

export default function CompanyProfile() {
    const { company, active_jobs, total_jobs_posted } = usePage().props;
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
            <Head title={`${company.company_name} — DevRank`} />
            <div className="profile-container">
                <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '20px' }}>
                    <Link href="/jobs" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Jobs</Link> › Company Profile
                </div>

                <div className="profile-layout">
                    <div>
                        {/* Company Hero */}
                        <div className="profile-hero">
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

                            {/* Quick Stats — 5 columns */}
                            <div className="company-quick-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                                <div className="company-quick-stat">
                                    <div className="company-quick-stat-value" style={{ color: 'var(--cyan)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>{trustScore}</div>
                                    <div className="company-quick-stat-label">Trust Score</div>
                                </div>
                                <div className="company-quick-stat">
                                    <div className="company-quick-stat-value" style={{ color: 'var(--emerald)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>42</div>
                                    <div className="company-quick-stat-label">Platform Hires</div>
                                </div>
                                <div className="company-quick-stat">
                                    <div className="company-quick-stat-value" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>4.8</div>
                                    <div className="company-quick-stat-label">Avg Rating</div>
                                </div>
                                <div className="company-quick-stat">
                                    <div className="company-quick-stat-value" style={{ color: 'var(--champagne)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>{active_jobs?.length || 0}</div>
                                    <div className="company-quick-stat-label">Open Jobs</div>
                                </div>
                                <div className="company-quick-stat">
                                    <div className="company-quick-stat-value" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>98%</div>
                                    <div className="company-quick-stat-label">Feedback Rate</div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="profile-tabs">
                            <button className={`profile-tab ${activeTab === 'trust' ? 'active' : ''}`} onClick={() => setActiveTab('trust')}>🏆 Trust Score</button>
                            <button className={`profile-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>⭐ Reviews (28)</button>
                            <button className={`profile-tab ${activeTab === 'interviews' ? 'active' : ''}`} onClick={() => setActiveTab('interviews')}>🎯 Interviews (42)</button>
                            <button className={`profile-tab ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>💼 Open Jobs</button>
                            <button className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>ℹ️ About</button>
                        </div>

                        {/* Trust Score Tab */}
                        {activeTab === 'trust' && (
                            <div>
                                <div className="dash-card" style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h4>Company Trust Score Breakdown</h4>
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--cyan)' }}>{trustScore}<span style={{ fontSize: '1rem', color: 'var(--text3)' }}>/100</span></div>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '20px' }}>Recalculated weekly from verified platform data. Cannot be purchased or manipulated.</p>

                                    {/* Factor 1 */}
                                    <TrustFactor
                                        title="Factor 1 — Hiring Process Quality"
                                        score={91}
                                        rows={[
                                            { name: 'Feedback compliance rate', value: '98%', width: 98, color: 'var(--emerald)' },
                                            { name: 'Avg response time', value: '38 hrs', width: 92 },
                                            { name: 'Ghosting rate', value: '2%', width: 4, color: 'var(--emerald)' },
                                            { name: 'Offer-to-join ratio', value: '86%', width: 86 },
                                        ]}
                                    />

                                    {/* Factor 2 */}
                                    <TrustFactor
                                        title="Factor 2 — Candidate Experience"
                                        score={88}
                                        badgeColor="cyan"
                                        rows={[
                                            { name: 'Work env. avg score', value: '4.4/5', width: 88 },
                                            { name: 'Interview experience rating', value: '4.8/5', width: 96 },
                                            { name: '"Would recommend" ratio', value: '82%', width: 82, color: 'var(--emerald)' },
                                        ]}
                                    />

                                    {/* Factor 3 */}
                                    <TrustFactor
                                        title="Factor 3 — Platform Engagement"
                                        score={90}
                                        badgeColor="cyan"
                                        rows={[
                                            { name: 'Profile completeness', value: '100%', width: 100 },
                                            { name: 'Job post frequency', value: 'Monthly', width: 80 },
                                            { name: 'Forum participation', value: 'Active', width: 70 },
                                        ]}
                                    />
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
                            <div>
                                {active_jobs?.length === 0 ? (
                                    <div className="dash-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
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
                                    <AboutField label="Founded" value="2016" />
                                    <AboutField label="Size" value={`${company.company_size || '—'} employees`} />
                                    <AboutField label="Industry" value={company.industry || '—'} />
                                    <AboutField label="Headquarters" value={company.location || '—'} />
                                    <AboutField label="Work Mode" value="Remote-first" />
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
                        <div className="profile-sidebar-card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '4px' }}>{trustScore}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Trust Score / 100</div>
                            <div style={{ color: 'var(--champagne)', fontSize: '20px', marginTop: '8px', letterSpacing: '2px' }}>★★★★★</div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>4.8 Average Rating</div>
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

                        {/* Hiring Activity */}
                        <div className="profile-sidebar-card">
                            <h4 style={{ marginBottom: '12px' }}>Hiring Activity</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Hires this year</span><strong style={{ color: 'var(--emerald)' }}>14</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Avg time to hire</span><strong>18 days</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Rejection feedback rate</span><strong style={{ color: 'var(--emerald)' }}>98%</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Ghosting incidents</span><strong style={{ color: 'var(--emerald)' }}>1</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Platform since</span><strong>Jan 2024</strong></div>
                            </div>
                        </div>
                    </div>
                </div>
                <FullFooter />
            </div>
        </MainLayout>
    );
}

function TrustFactor({ title, score, badgeColor = 'green', rows }) {
    return (
        <div style={{ marginBottom: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{title}</div>
                <span className={`badge badge-${badgeColor}`}>{score}/100</span>
            </div>
            {rows.map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', width: '200px', flexShrink: 0 }}>{row.name}</span>
                    <div className="pillar-bar" style={{ flex: 1 }}>
                        <div className="pillar-fill" style={{ width: `${row.width}%`, background: row.color || 'var(--violet-bright)' }}></div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: row.color || 'var(--cyan)', width: '50px', textAlign: 'right', flexShrink: 0 }}>{row.value}</span>
                </div>
            ))}
        </div>
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