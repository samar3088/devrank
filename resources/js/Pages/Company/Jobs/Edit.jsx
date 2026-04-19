import '../../../../../css/pages/company/job-form.css';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import CompanyLayout from '@/Layouts/CompanyLayout';
import LoadingButton from '@/Components/LoadingButton';

export default function EditJob() {
    const { job, tags } = usePage().props;
    const [tagSearch, setTagSearch] = useState('');

    const form = useForm({
        title:           job.title           ?? '',
        description:     job.description     ?? '',
        requirements:    job.requirements    ?? '',
        benefits:        job.benefits        ?? '',
        job_type:        job.job_type        ?? 'full-time',
        work_mode:       job.work_mode       ?? 'onsite',
        location:        job.location        ?? '',
        experience_level: job.experience_level ?? '',
        experience_range: job.experience_range ?? '',
        salary_min:      job.salary_min      ? String(job.salary_min) : '',
        salary_max:      job.salary_max      ? String(job.salary_max) : '',
        salary_currency: job.salary_currency ?? 'INR',
        salary_period:   job.salary_period   ?? 'yearly',
        status:          job.status          ?? 'active',
        tags:            job.tags?.map(t => t.id) ?? [],
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.put(`/company/jobs/${job.id}`, {
            onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        });
    }

    function toggleTag(tagId) {
        const current = [...form.data.tags];
        const index = current.indexOf(tagId);
        if (index > -1) {
            current.splice(index, 1);
        } else if (current.length < 10) {
            current.push(tagId);
        }
        form.setData('tags', current);
    }

    const filteredTags = tags.filter(t =>
        t.name.toLowerCase().includes(tagSearch.toLowerCase())
    );

    const selectedTagNames = tags
        .filter(t => form.data.tags.includes(t.id))
        .map(t => t.name);

    return (
        <CompanyLayout>
            <Head title={`Edit: ${job.title}`} />

            <div className="job-form-wrapper">
                {/* Header */}
                <div className="job-form-header">
                    <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 10 }}>
                        <Link href="/company/jobs" style={{ color: 'var(--text3)', textDecoration: 'none' }}>My Jobs</Link>
                        {' '} › Edit
                    </div>
                    <h1>Edit Job Post</h1>
                    <p>Update the details for <strong>{job.title}</strong>.</p>
                </div>

                {/* Global errors */}
                {Object.keys(form.errors).length > 0 && (
                    <div style={{
                        background: 'color-mix(in srgb, var(--coral) 10%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--coral) 30%, transparent)',
                        borderRadius: 'var(--r)',
                        padding: '12px 16px',
                        marginBottom: 24,
                        fontSize: 13,
                        color: 'var(--coral)',
                    }}>
                        Please fix the errors below before saving.
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

                    {/* ── Left: Main Form ─────────────────────────────── */}
                    <form onSubmit={handleSubmit}>

                        {/* Basic Info */}
                        <div className="job-form-section">
                            <div className="job-form-section-title">Basic Information</div>

                            <div className="form-group">
                                <label className="form-label">
                                    Job Title <span style={{ color: 'var(--coral)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-input${form.errors.title ? ' is-error' : ''}`}
                                    placeholder="e.g. Senior React Developer"
                                    value={form.data.title}
                                    onChange={e => form.setData('title', e.target.value)}
                                />
                                {form.errors.title && <span className="form-error">{form.errors.title}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Job Description <span style={{ color: 'var(--coral)' }}>*</span>
                                </label>
                                <textarea
                                    className={`form-input${form.errors.description ? ' is-error' : ''}`}
                                    rows={6}
                                    placeholder="Describe the role, responsibilities, and what the candidate will work on..."
                                    value={form.data.description}
                                    onChange={e => form.setData('description', e.target.value)}
                                    style={{ resize: 'vertical' }}
                                />
                                {form.errors.description && <span className="form-error">{form.errors.description}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Requirements <span style={{ color: 'var(--coral)' }}>*</span>
                                </label>
                                <textarea
                                    className={`form-input${form.errors.requirements ? ' is-error' : ''}`}
                                    rows={5}
                                    placeholder="List the skills, qualifications, and experience required..."
                                    value={form.data.requirements}
                                    onChange={e => form.setData('requirements', e.target.value)}
                                    style={{ resize: 'vertical' }}
                                />
                                {form.errors.requirements && <span className="form-error">{form.errors.requirements}</span>}
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Benefits</label>
                                <textarea
                                    className="form-input"
                                    rows={4}
                                    placeholder="Salary, health insurance, remote work, learning budget..."
                                    value={form.data.benefits}
                                    onChange={e => form.setData('benefits', e.target.value)}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        {/* Job Details */}
                        <div className="job-form-section">
                            <div className="job-form-section-title">Job Details</div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Job Type</label>
                                    <select
                                        className="form-select"
                                        value={form.data.job_type}
                                        onChange={e => form.setData('job_type', e.target.value)}
                                    >
                                        <option value="full-time">Full-time</option>
                                        <option value="part-time">Part-time</option>
                                        <option value="contract">Contract</option>
                                        <option value="freelance">Freelance</option>
                                        <option value="internship">Internship</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Work Mode</label>
                                    <select
                                        className="form-select"
                                        value={form.data.work_mode}
                                        onChange={e => form.setData('work_mode', e.target.value)}
                                    >
                                        <option value="onsite">Onsite</option>
                                        <option value="remote">Remote</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Bengaluru, Remote"
                                        value={form.data.location}
                                        onChange={e => form.setData('location', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Experience Level</label>
                                    <select
                                        className="form-select"
                                        value={form.data.experience_level}
                                        onChange={e => form.setData('experience_level', e.target.value)}
                                    >
                                        <option value="">Select level</option>
                                        <option value="junior">Junior</option>
                                        <option value="mid">Mid-level</option>
                                        <option value="senior">Senior</option>
                                        <option value="lead">Lead / Principal</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Experience Range</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. 3–5 years"
                                    value={form.data.experience_range}
                                    onChange={e => form.setData('experience_range', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Salary */}
                        <div className="job-form-section">
                            <div className="job-form-section-title">Salary (Optional)</div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Minimum</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="e.g. 1200000"
                                        value={form.data.salary_min}
                                        onChange={e => form.setData('salary_min', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Maximum</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="e.g. 1800000"
                                        value={form.data.salary_max}
                                        onChange={e => form.setData('salary_max', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-row" style={{ marginBottom: 0 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Currency</label>
                                    <select
                                        className="form-select"
                                        value={form.data.salary_currency}
                                        onChange={e => form.setData('salary_currency', e.target.value)}
                                    >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Period</label>
                                    <select
                                        className="form-select"
                                        value={form.data.salary_period}
                                        onChange={e => form.setData('salary_period', e.target.value)}
                                    >
                                        <option value="yearly">Per Year</option>
                                        <option value="monthly">Per Month</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="job-form-section">
                            <div className="job-form-section-title">Listing Status</div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={form.data.status}
                                    onChange={e => form.setData('status', e.target.value)}
                                >
                                    <option value="active">Active — visible to candidates</option>
                                    <option value="paused">Paused — hidden from listing</option>
                                    <option value="closed">Closed — no more applications</option>
                                </select>
                                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                                    Pausing a job hides it from the public board without deleting it.
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <LoadingButton
                                type="submit"
                                className="btn btn-primary"
                                loading={form.processing}
                                style={{ padding: '12px 28px', fontSize: 15 }}
                            >
                                Save Changes
                            </LoadingButton>
                            <Link href="/company/jobs" className="btn btn-ghost">
                                Discard
                            </Link>
                        </div>
                    </form>

                    {/* ── Right: Tag Picker ───────────────────────────── */}
                    <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)' }}>
                        <div className="job-form-section" style={{ marginBottom: 0 }}>
                            <div className="job-form-section-title">
                                Tags
                                <span style={{ float: 'right', fontWeight: 400, color: 'var(--text3)', fontSize: 11 }}>
                                    {form.data.tags.length} / 10
                                </span>
                            </div>

                            {/* Selected tag pills */}
                            {form.data.tags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                    {selectedTagNames.map((name, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                padding: '3px 10px',
                                                background: 'color-mix(in srgb, var(--violet) 18%, transparent)',
                                                border: '1px solid var(--violet-bright)',
                                                borderRadius: 999,
                                                fontSize: 12,
                                                color: 'var(--violet-bright)',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {name}
                                            <button
                                                type="button"
                                                onClick={() => toggleTag(tags.find(t => t.name === name)?.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--violet-bright)', padding: 0, lineHeight: 1 }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {form.errors.tags && (
                                <span className="form-error" style={{ display: 'block', marginBottom: 8 }}>
                                    {form.errors.tags}
                                </span>
                            )}

                            {/* Search */}
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search tags..."
                                value={tagSearch}
                                onChange={e => setTagSearch(e.target.value)}
                                style={{ marginBottom: 10, fontSize: 13 }}
                            />

                            {/* Tag list */}
                            <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {filteredTags.length === 0 ? (
                                    <div style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>No tags found.</div>
                                ) : (
                                    filteredTags.map(tag => {
                                        const selected = form.data.tags.includes(tag.id);
                                        const disabled = !selected && form.data.tags.length >= 10;
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                disabled={disabled}
                                                onClick={() => toggleTag(tag.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '7px 10px',
                                                    borderRadius: 'var(--r)',
                                                    border: selected
                                                        ? '1px solid var(--violet-bright)'
                                                        : '1px solid transparent',
                                                    background: selected
                                                        ? 'color-mix(in srgb, var(--violet) 12%, transparent)'
                                                        : 'transparent',
                                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                                    opacity: disabled ? 0.4 : 1,
                                                    textAlign: 'left',
                                                    fontSize: 13,
                                                    color: selected ? 'var(--violet-bright)' : 'var(--text2)',
                                                    transition: 'all 0.15s',
                                                    width: '100%',
                                                }}
                                            >
                                                <span>{tag.name}</span>
                                                {selected && <span style={{ fontSize: 11 }}>✓</span>}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Job info card */}
                        <div style={{
                            marginTop: 16,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r-lg)',
                            padding: 20,
                            fontSize: 13,
                            color: 'var(--text3)',
                            lineHeight: 1.7,
                        }}>
                            <div style={{ fontWeight: 700, color: 'var(--text2)', marginBottom: 8 }}>ℹ️ Job Info</div>
                            <div>Posted: <strong style={{ color: 'var(--text2)' }}>{job.published_at ? new Date(job.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</strong></div>
                            <div style={{ marginTop: 4 }}>Expires: <strong style={{ color: 'var(--champagne)' }}>{job.expires_at ? new Date(job.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</strong></div>
                            <div style={{ marginTop: 4 }}>Applications: <strong style={{ color: 'var(--cyan)' }}>{job.applications_count ?? 0}</strong></div>
                            <div style={{ marginTop: 4 }}>Views: <strong>{job.views_count ?? 0}</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        </CompanyLayout>
    );
}
