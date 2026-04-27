import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminFilterBar, AdminPagination, fmtDate } from '@/Pages/Admin/AdminShared';

export default function AdminTags() {
    const { tags, filters, stats } = usePage().props;

    function approve(id) { router.post(`/admin/tags/${id}/approve`, {}, { preserveScroll: true }); }
    function reject(id)  { router.post(`/admin/tags/${id}/reject`,  {}, { preserveScroll: true }); }

    const statusColor = { approved: 'green', pending: 'amber', rejected: 'red' };

    return (
        <AdminLayout title="Tag Approval" stats={stats}>
            <div className="admin-page-header">
                <div><h1>Tags</h1><p>{stats?.pending_tags || 0} pending approval</p></div>
            </div>

            <AdminFilterBar route="/admin/tags" filters={filters} placeholder="Search tags..."
                selectName="status" selectOptions={[
                    { value: 'pending',  label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                ]} />

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead><tr><th>Tag</th><th>Suggested By</th><th>Topics</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {tags.data.length === 0 ? (
                            <tr><td colSpan={6} className="admin-empty">No tags found.</td></tr>
                        ) : tags.data.map(tag => (
                            <tr key={tag.id}>
                                <td>
                                    <span style={{ fontWeight: 600, color: 'var(--violet-bright)' }}>#{tag.name}</span>
                                </td>
                                <td style={{ fontSize: 13 }}>{tag.suggested_by?.name || 'System'}</td>
                                <td><span style={{ fontWeight: 600 }}>{tag.topics_count || 0}</span></td>
                                <td>{fmtDate(tag.created_at)}</td>
                                <td>
                                    <span className={`admin-badge admin-badge-${statusColor[tag.status] || 'gray'}`}>
                                        {tag.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {tag.status !== 'approved' && (
                                            <button onClick={() => approve(tag.id)} className="admin-action-btn green">Approve</button>
                                        )}
                                        {tag.status !== 'rejected' && (
                                            <button onClick={() => reject(tag.id)} className="admin-action-btn red">Reject</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <AdminPagination data={tags} />
            </div>
        </AdminLayout>
    );
}