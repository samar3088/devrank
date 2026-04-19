import { Head, Link, usePage, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import LoadingButton from '@/Components/LoadingButton';
import { FullFooter } from '@/Components/Footer';

export default function JobShow() {
    const { job, auth, hasApplied, canApply, flash } = usePage().props;

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    function formatSalary(min, max, currency) {
        if (!min && !max) return null;
        if (currency === 'INR') {
            if (min && max) return `₹${(min / 100000).toFixed(0)}–${(max / 100000).toFixed(0)} LPA`;
            if (min) return `₹${(min / 100000).toFixed(0)}L+`;
            return `Up to ₹${(max / 100000).toFixed(0)}L`;
        }
        if (min && max) return `${currency} ${min.toLocaleString()} – ${max.toLocaleString()}`;
        return null;
    }

    function daysLeft(date) {
        if (!date) return '';
        const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff <= 0) return 'Expired';
        return `${diff} days left`;
    }

    function renderLines(text) {
        if (!text) return null;
        return text.split('\n').filter(l => l.trim()).map((line, i) => {
            const trimmed = line.replace(/^[-•]\s*/, '').trim();
            if (!trimmed) return null;
            return <div key={i} className="req-item">{trimmed}</div>;
        });
    }

    const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
    const trustScore = job.company?.trust_score || 0;
    const stars = '★'.repeat(Math.round(trustScore / 20));

    return (
        <MainLayout>
            <Head title={job.title} />
            <div className="job-detail-container">
                {/* Breadcrumb */}
                <div className="job-detail-breadcrumb">
                    <Link href="/jobs">Jobs</Link> › <span>{job.company?.company_name}</span> › {job.title}
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div style={{ background: 'var(--emerald-soft)', border: '1px solid var(--emerald-border)', color: 'var(--emerald)', padding: '12px 18px', borderRadius: 'var(--r)', marginBottom: '16px', fontSize: '14px' }}>
                        ✓ {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div style={{ background: 'var(--coral-soft)', border: '1px solid var(--coral-border)', color: 'var(--coral)', padding: '12px 18px', borderRadius: 'var(--r)', marginBottom: '16px', fontSize: '14px' }}>
                        {flash.error}
                    </div>
                )}

                <div className="job-detail-layout">
                    {/* Main Content */}
                    <div>
                        {/* Job Hero */}
                        <div className="job-hero">
                            <div className="job-hero-top">
                                <div>
                                    <div className="job-hero-company">
                                        <div className="job-hero-logo">{getInitials(job.company?.company_name)}</div>
                                        <div>
                                            <span className="job-hero-company-name">{job.company?.company_name}</span>
                                            <div className="job-hero-badges">
                                                {trustScore >= 80 && <span className="badge badge-amber">🏅 Transparent</span>}
                                                {trustScore >= 70 && <span className="badge badge-cyan">✅ Trusted Hirer</span>}
                                                <span className="stars-sm">{stars}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{trustScore}/100 Trust</span>
                                            </div>
                                        </div>
                                    </div>
                                    <h2>{job.title}</h2>
                                    <div className="job-hero-meta">
                                        <span>📍 {job.location || job.work_mode}</span>
                                        <span>⏱ {job.job_type}</span>
                                        {job.experience_range && <span>🧑‍💼 {job.experience_range}</span>}
                                        <span>⏳ Posted {new Date(job.published_at || job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                        <span>👥 {job.applications_count} applicants</span>
                                    </div>
                                </div>
                                {salary && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="job-hero-salary">{salary}</div>
                                        <div className="job-hero-salary-sub">Annual CTC</div>
                                    </div>
                                )}
                            </div>
                            {job.tags?.length > 0 && (
                                <div className="tags" style={{ marginTop: '16px' }}>
                                    {job.tags.map(tag => <span key={tag.id} className="tag">{tag.name}</span>)}
                                </div>
                            )}
                        </div>

                        {job.description && (
                            <div className="section-block"><h4>About the Role</h4><p>{job.description}</p></div>
                        )}
                        {job.requirements && (
                            <div className="section-block"><h4>Requirements</h4>{renderLines(job.requirements)}</div>
                        )}
                        {job.benefits && (
                            <div className="section-block"><h4>What We Offer</h4>{renderLines(job.benefits)}</div>
                        )}

                        {/* Interview Process */}
                        <div className="section-block">
                            <h4>Interview Process</h4>
                            <div style={{ background: 'var(--violet-soft)', border: '1px solid var(--violet-border)', borderRadius: 'var(--r)', padding: '12px 16px', fontSize: '13px', color: 'var(--violet-bright)', marginBottom: '16px' }}>
                                💡 This company uses DevRank's free first screening service.
                            </div>
                            <div className="process-steps">
                                {[
                                    ['DevRank Screening (Optional Free)', '20–30 min · Technical + communication check'],
                                    ['Technical Interview', '60 min · Deep-dive + live coding'],
                                    ['System Design', '45 min · Architecture discussion'],
                                    ['Culture Fit / HR', '30 min · Team + values alignment'],
                                ].map(([title, desc], i) => (
                                    <div key={i} className="process-step">
                                        <div className="process-step-num">{i + 1}</div>
                                        <div><div className="process-step-title">{title}</div><div className="process-step-desc">{desc}</div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Apply Sidebar */}
                    <div className="apply-box">
                        {salary && (
                            <>
                                <div className="apply-salary">{salary}</div>
                                <div className="apply-salary-sub">Annual CTC · Negotiable</div>
                            </>
                        )}

                        {hasApplied ? (
                            <div style={{ background: 'var(--emerald-soft)', border: '1px solid var(--emerald-border)', color: 'var(--emerald)', padding: '12px', borderRadius: 'var(--r)', textAlign: 'center', fontWeight: 600, marginBottom: '10px' }}>
                                ✅ You've already applied
                            </div>
                        ) : auth?.user && !auth.user.roles?.includes('company') ? (
                            <ApplyForm jobId={job.id} canApply={canApply} />
                        ) : auth?.user?.roles?.includes('company') ? (
                            <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text3)', fontSize: '13px' }}>
                                Companies cannot apply to jobs.
                            </div>
                        ) : (
                            <Link href="/account" className="apply-btn-full">Log In to Apply</Link>
                        )}

                        <button className="save-btn-full">🔖 Save Job</button>
                        <hr className="apply-divider" />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div className="apply-stat-row"><span className="apply-stat-label">Deadline</span><span className="apply-stat-value">{daysLeft(job.expires_at)}</span></div>
                            <div className="apply-stat-row"><span className="apply-stat-label">Applicants</span><span className="apply-stat-value">{job.applications_count}</span></div>
                            <div className="apply-stat-row"><span className="apply-stat-label">Work Mode</span><span className="apply-stat-value">{job.work_mode}</span></div>
                            <div className="apply-stat-row"><span className="apply-stat-label">Experience</span><span className="apply-stat-value">{job.experience_range || job.experience_level || '—'}</span></div>
                        </div>

                        {!hasApplied && canApply && (
                            <div className="apply-match">🎯 Candidates with relevant skills are a strong match!</div>
                        )}

                        <hr className="apply-divider" />
                        <div className="apply-share-title">Share This Job</div>
                        <div className="apply-share-btns">
                            <button className="apply-share-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}>🔗</button>
                            <button className="apply-share-btn" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(job.title)}`, '_blank')}>𝕏</button>
                            <button className="apply-share-btn" onClick={() => window.open(`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(job.title)}`, '_blank')}>in</button>
                            <button className="apply-share-btn">📧</button>
                        </div>
                    </div>
                </div>
                <FullFooter />
            </div>
        </MainLayout>
    );
}

function ApplyForm({ jobId, canApply }) {
    const form = useForm({ cover_letter: '' });

    function handleSubmit(e) {
        e.preventDefault();
        form.post(`/jobs/${jobId}/apply`, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    if (!canApply) {
        return (
            <div style={{ background: 'var(--champagne-soft)', border: '1px solid var(--champagne-border)', color: 'var(--champagne)', padding: '12px', borderRadius: 'var(--r)', textAlign: 'center', fontSize: '13px', marginBottom: '10px' }}>
                ⚠️ Monthly application limit reached (5/5)
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '10px' }}>
            <textarea
                style={{
                    width: '100%', minHeight: '80px', resize: 'vertical',
                    background: 'var(--bg2)', border: '1px solid var(--border2)',
                    color: 'var(--text)', borderRadius: 'var(--r)',
                    padding: '10px 12px', fontSize: '13px', lineHeight: '1.6',
                    outline: 'none', fontFamily: "'Geist', system-ui, sans-serif",
                    boxSizing: 'border-box', marginBottom: '10px',
                }}
                placeholder="Write a short cover letter (optional)..."
                value={form.data.cover_letter}
                onChange={e => form.setData('cover_letter', e.target.value)}
            />
            {form.errors.cover_letter && (
                <div style={{ color: 'var(--coral)', fontSize: '12px', marginBottom: '8px' }}>{form.errors.cover_letter}</div>
            )}
            <LoadingButton type="submit" loading={form.processing} className="apply-btn-full">
                {form.processing ? 'Submitting...' : 'Apply Now'}
            </LoadingButton>
        </form>
    );
}
