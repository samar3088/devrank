import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

export default function JobsIndex() {
    const { jobs, tags, filters, auth } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');

    function handleSearch(e) {
        e.preventDefault();
        applyFilters({ search });
    }

    function applyFilters(overrides = {}) {
        router.get('/jobs', { ...filters, ...overrides }, {
            preserveState: true,
            replace: true,
        });
    }

    function clearFilters() {
        router.get('/jobs', {}, { preserveState: true, replace: true });
        setSearch('');
    }

    function formatSalary(min, max, currency) {
        if (!min && !max) return null;
        const fmt = (n) => {
            if (currency === 'INR') return `₹${(n / 100000).toFixed(0)}L`;
            return `${currency} ${n.toLocaleString()}`;
        };
        if (min && max) return `${fmt(min)}–${fmt(max)} LPA`;
        if (min) return `${fmt(min)}+`;
        return `Up to ${fmt(max)}`;
    }

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    function daysLeft(date) {
        if (!date) return '';
        const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff <= 0) return 'Expired';
        return `${diff} days left`;
    }

    return (
        <MainLayout>
            <Head title="Job Board" />
            <div className="jobs-container">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Job Board</h1>
                        <p style={{ color: 'var(--text2)', fontSize: '15px' }}>Jobs from companies with verified Trust Scores. No ghosting guaranteed.</p>
                    </div>
                    {auth?.user?.roles?.includes('company') && (
                        <Link href="/company/jobs/create" className="btn-sm btn-primary-sm" style={{ padding: '10px 20px', fontSize: '14px' }}>Post a Job</Link>
                    )}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="jobs-search-bar">
                    <input
                        type="text"
                        className="jobs-search-input"
                        placeholder="🔍  Search jobs — title, skill, company…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button type="submit" className="btn-sm btn-primary-sm" style={{ padding: '10px 20px' }}>Search</button>
                </form>

                <div className="jobs-layout">
                    {/* Filter Panel */}
                    <div className="filter-panel">
                        <div className="filter-panel-header">
                            <h4>Filters</h4>
                            <button className="filter-clear" onClick={clearFilters}>Clear all</button>
                        </div>

                        {/* Job Type */}
                        <div className="filter-section">
                            <div className="filter-title">Job Type</div>
                            {['full-time', 'contract', 'internship', 'part-time', 'freelance'].map(type => (
                                <label key={type} className="filter-option">
                                    <input
                                        type="radio"
                                        name="job_type"
                                        checked={filters?.job_type === type}
                                        onChange={() => applyFilters({ job_type: type })}
                                    />
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </label>
                            ))}
                        </div>

                        {/* Work Mode */}
                        <div className="filter-section">
                            <div className="filter-title">Work Mode</div>
                            {['remote', 'hybrid', 'onsite'].map(mode => (
                                <label key={mode} className="filter-option">
                                    <input
                                        type="radio"
                                        name="work_mode"
                                        checked={filters?.work_mode === mode}
                                        onChange={() => applyFilters({ work_mode: mode })}
                                    />
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </label>
                            ))}
                        </div>

                        {/* Experience */}
                        <div className="filter-section">
                            <div className="filter-title">Experience Level</div>
                            {['junior', 'mid', 'senior', 'lead'].map(level => (
                                <label key={level} className="filter-option">
                                    <input
                                        type="radio"
                                        name="experience"
                                        checked={filters?.experience === level}
                                        onChange={() => applyFilters({ experience: level })}
                                    />
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </label>
                            ))}
                        </div>

                        {/* Skills Tags */}
                        <div className="filter-section">
                            <div className="filter-title">Skills</div>
                            <div className="tags" style={{ gap: '6px' }}>
                                {tags.slice(0, 12).map(tag => (
                                    <span
                                        key={tag.id}
                                        className={`tag ${parseInt(filters?.tag) === tag.id ? 'active-tag' : ''}`}
                                        onClick={() => applyFilters({ tag: parseInt(filters?.tag) === tag.id ? '' : tag.id })}
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Jobs List */}
                    <div>
                        <div className="pub-job-results">
                            <span>{jobs.total} jobs found</span>
                        </div>

                        {jobs.data.length === 0 ? (
                            <div className="forum-empty">
                                <h3>No jobs match your filters</h3>
                                <p>Try adjusting your search or clearing filters.</p>
                            </div>
                        ) : (
                            jobs.data.map(job => (
                                <div key={job.id} className={`pub-job-card ${job.is_featured ? 'featured' : ''}`}>
                                    <div>
                                        {job.is_featured && (
                                            <div style={{ marginBottom: '10px' }}><span className="badge badge-amber">⭐ Featured</span></div>
                                        )}
                                        <div className="job-company-row">
                                            <div className="company-logo-sm">
                                                {getInitials(job.company?.company_name)}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 600 }}>{job.company?.company_name}</div>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <span className="stars-sm">{'★'.repeat(Math.round((job.company?.trust_score || 80) / 20))}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                                                        {job.company?.trust_score || '—'}/100 Trust
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/jobs/${job.slug}`} className="pub-job-title">{job.title}</Link>
                                        <div className="pub-job-meta">
                                            <span>📍 {job.location || job.work_mode}</span>
                                            <span>⏱ {job.job_type}</span>
                                            {job.experience_range && <span>🧑‍💼 {job.experience_range}</span>}
                                            <span>⏳ {daysLeft(job.expires_at)}</span>
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
                                        <Link href={`/jobs/${job.slug}`} className="btn-sm btn-primary-sm">Apply Now</Link>
                                        <span className="pub-job-applicants">{job.applications_count} applicants</span>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Pagination */}
                        {jobs.last_page > 1 && (
                            <div className="forum-pagination">
                                {jobs.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`page-btn ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <FullFooter />
            </div>
        </MainLayout>
    );
}
