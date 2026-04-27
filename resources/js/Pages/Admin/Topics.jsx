import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminFilterBar, AdminPagination, fmtDate } from '@/Pages/Admin/AdminShared';

export default function AdminTopics() {
    const { topics, filters, stats } = usePage().props;
    const statusColor = { open: 'green', closed: 'gray', moderated: 'red' };

    return (
        <AdminLayout title="Forum Topics" stats={stats}>
            <div className="admin-page-header">
                <div><h1>Forum Topics</h1><p>{topics.total} total topics</p></div>
            </div>

            <AdminFilterBar route="/admin/topics" filters={filters} placeholder="Search topics..."
                selectName="status" selectOptions={[
                    { value: 'open',      label: 'Open' },
                    { value: 'closed',    label: 'Closed' },
                    { value: 'moderated', label: 'Moderated' },
                ]} />

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead><tr><th>Topic</th><th>Category</th><th>Author</th><th>Replies</th><th>Views</th><th>Posted</th><th>Status</th></tr></thead>
                    <tbody>
                        {topics.data.length === 0 ? (
                            <tr><td colSpan={7} className="admin-empty">No topics found.</td></tr>
                        ) : topics.data.map(topic => (
                            <tr key={topic.id}>
                                <td>
                                    <a href={`/forum/${topic.slug}`} target="_blank"
                                        style={{ fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
                                        {topic.title.slice(0, 60)}{topic.title.length > 60 ? '…' : ''}
                                    </a>
                                    {topic.is_pinned && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--champagne)' }}>📌</span>}
                                </td>
                                <td style={{ fontSize: 12, color: 'var(--text3)' }}>{topic.category?.name}</td>
                                <td style={{ fontSize: 13 }}>{topic.user?.name}</td>
                                <td>{topic.replies_count}</td>
                                <td>{topic.views_count?.toLocaleString()}</td>
                                <td>{fmtDate(topic.created_at)}</td>
                                <td>
                                    <span className={`admin-badge admin-badge-${statusColor[topic.status] || 'gray'}`}>
                                        {topic.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <AdminPagination data={topics} />
            </div>
        </AdminLayout>
    );
}