import '../../../../css/pages/company/jobs.css';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import CompanyLayout from '@/Layouts/CompanyLayout';

export default function JobsIndex() {
    const { jobs, monthlyPostsRemaining, flash, filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');

    function getLimitClass() {
        if (monthlyPostsRemaining <= 0) return 'danger';
        if (monthlyPostsRemaining <= 2) return 'warn';
        return '';
    }

    function getStatusClass(status) {
        return `status-badge status-${status}`;
    }

    function formatSalary(min, max, currency) {
        if (!min && !max) return null;
        const fmt = (n) => {
            if (currency === 'INR') return `₹${(n / 100000).toFixed(1)}L`;
            return `${currency} ${n.toLocaleString()}`;
        };
        if (min && max) return `${fmt(min)} – ${fmt(max)}`;
        if (min) return `${fmt(min)}+`;
        return `Up to ${fmt(max)}`;
    }

    function formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }

    function handleSearch(e) {
        e.preventDefault();
        router.get('/company/jobs', { search, status: filters?.status }, {
            preserveState: true,
            replace: true,
        });
    }

    function handleStatusFilter(status) {
        router.get('/company/jobs', { search: filters?.search, status }, {
            preserveState: true,
            replace: true,
        });
    }

    function handleDelete(jobId) {
        if (confirm('Are you sure you want to delete this job?')) {
            router.delete(`/company/jobs/${jobId}`);
        }
    }

    return (
        <CompanyLayout>
            <Head title="My Jobs" />
            <div>
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="flash-success">✓ {flash.success}</div>
                )}

                {/* Header */}
                <div className="jobs-header">
                    <h1>My Job Listings</h1>
                    <div className="jobs-header-actions">
                        <div className={`jobs-limit-badge ${getLimitClass()}`}>
                            Posts remaining: <span className="jobs-limit-count">{monthlyPostsRemaining}</span>
                        </div>
                        {monthlyPostsRemaining > 0 ? (
                            <Link href="/company/jobs/create" className="btn-sm btn-primary-sm">
                                + Post New Job
                            </Link>
                        ) : (
                            <span className="btn-sm btn-outline-sm" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                Limit Reached
                            </span>
                        )}
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                }}>
                    <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '200px' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search jobs by title..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ maxWidth: '300px' }}
                        />
                    </form>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {['all', 'active', 'draft', 'expired', 'closed'].map(status => (
                            <button
                                key={status}
                                onClick={() => handleStatusFilter(status)}
                                className={`btn-sm ${filters?.status === status ? 'btn-primary-sm' : 'btn-outline-sm'}`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Jobs List */}
                {jobs.data.length === 0 ? (
                    <div className="jobs-empty">
                        <div className="jobs-empty-icon">💼</div>
                        <h3>No jobs found</h3>
                        <p>
                            {filters?.search || filters?.status !== 'all'
                                ? 'Try adjusting your search or filters.'
                                : 'Post your first job and start receiving applications.'
                            }
                        </p>
                        {!filters?.search && filters?.status === 'all' && (
                            <Link href="/company/jobs/create" className="btn-sm btn-primary-sm">
                                + Post Your First Job
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {jobs.data.map(job => (
                            <div key={job.id} className={`job-card ${job.is_featured ? 'featured' : ''}`}>
                                <div>
                                    <div className="job-card-title">{job.title}</div>
                                    <div className="job-card-meta">
                                        <span>{job.job_type}</span>
                                        <span>{job.work_mode}</span>
                                        {job.location && <span>📍 {job.location}</span>}
                                        {job.experience_range && <span>🧑‍💼 {job.experience_range}</span>}
                                        <span>Posted {formatDate(job.published_at || job.created_at)}</span>
                                    </div>
                                    {job.tags && job.tags.length > 0 && (
                                        <div className="job-card-tags">
                                            {job.tags.map(tag => (
                                                <span key={tag.id} className="job-tag">{tag.name}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="job-card-stats">
                                        <span className="job-card-stat">👥 {job.applications_count || 0} applicants</span>
                                        <span className="job-card-stat">👁 {job.views_count || 0} views</span>
                                        {job.expires_at && (
                                            <span className="job-card-stat">⏳ Expires {formatDate(job.expires_at)}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="job-card-actions">
                                    {formatSalary(job.salary_min, job.salary_max, job.salary_currency) && (
                                        <div className="job-salary">
                                            {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                                        </div>
                                    )}
                                    <span className={getStatusClass(job.status)}>{job.status}</span>
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                        <Link href={`/company/jobs/${job.id}/edit`} className="btn-sm btn-outline-sm">
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            className="btn-sm btn-danger-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {jobs.last_page > 1 && (
                            <div className="pagination-wrapper">
                                {jobs.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`page-link ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </CompanyLayout>
    );
}