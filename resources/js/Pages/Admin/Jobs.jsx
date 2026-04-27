import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminFilterBar, AdminPagination, fmtDate } from '@/Pages/Admin/AdminShared';

export default function AdminJobs() {
    const { jobs, filters, stats } = usePage().props;

    function toggleFeatured(id) {
        router.post(`/admin/jobs/${id}/featured`, {}, { preserveScroll: true });
    }

    function setStatus(id, status) {
        router.post(`/admin/jobs/${id}/status`, { status }, { preserveScroll: true });
    }

    const statusColor = { active: 'green', paused: 'amber', closed: 'gray', expired: 'red' };

    return (
        <AdminLayout title="Job Posts" stats={stats}>
            <div className="admin-page-header">
                <div><h1>Job Posts</h1><p>{jobs.total} total jobs</p></div>
            </div>

            <AdminFilterBar route="/admin/jobs" filters={filters} placeholder="Search by title..."
                selectName="status" selectOptions={[
                    { value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' },
                    { value: 'closed', label: 'Closed' }, { value: 'expired', label: 'Expired' },
                ]} />

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead><tr><th>Job</th><th>Company</th><th>Applications</th><th>Posted</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {jobs.data.length === 0 ? (
                            <tr><td colSpan={7} className="admin-empty">No jobs found.</td></tr>
                        ) : jobs.data.map(job => (
                            <tr key={job.id}>
                                <td>
                                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{job.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                                        {job.work_mode} · {job.job_type}
                                        {job.is_featured && <span style={{ marginLeft: 6, color: 'var(--champagne)' }}>⭐ Featured</span>}
                                    </div>
                                </td>
                                <td style={{ fontSize: 13 }}>{job.company?.company_name || job.company?.name}</td>
                                <td><span style={{ fontWeight: 600 }}>{job.applications_count || 0}</span></td>
                                <td>{fmtDate(job.published_at)}</td>
                                <td>{fmtDate(job.expires_at)}</td>
                                <td>
                                    <span className={`admin-badge admin-badge-${statusColor[job.status] || 'gray'}`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                        <button onClick={() => toggleFeatured(job.id)}
                                            className={`admin-action-btn ${job.is_featured ? 'amber' : ''}`}>
                                            {job.is_featured ? '★ Unfeature' : '☆ Feature'}
                                        </button>
                                        {job.status === 'active' && (
                                            <button onClick={() => setStatus(job.id, 'closed')} className="admin-action-btn red">Close</button>
                                        )}
                                        {job.status !== 'active' && (
                                            <button onClick={() => setStatus(job.id, 'active')} className="admin-action-btn green">Activate</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <AdminPagination data={jobs} />
            </div>
        </AdminLayout>
    );
}