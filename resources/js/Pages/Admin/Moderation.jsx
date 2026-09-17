import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import CountUp from '@/Components/CountUp';
import { AdminFilterBar, AdminPagination, fmtDate } from '@/Pages/Admin/AdminShared';

export default function AdminModeration() {
    const { replies, filters, stats } = usePage().props;

    function action(id, act) {
        router.post(`/admin/moderation/${id}`, { action: act }, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Forum Moderation" stats={stats}>
            <div className="admin-page-header" data-reveal="fade">
                <div>
                    <h1>Moderation Queue</h1>
                    <p><CountUp end={replies.total} /> flagged replies awaiting review</p>
                </div>
            </div>

            <AdminFilterBar route="/admin/moderation" filters={filters} placeholder="Search flagged replies..." />

            <div className="admin-table-wrap" data-reveal="fade">
                <table className="admin-table">
                    <thead><tr><th>Reply Preview</th><th>Author</th><th>Topic</th><th>AI Score</th><th>Flagged</th><th>Actions</th></tr></thead>
                    <tbody>
                        {replies.data.length === 0 ? (
                            <tr><td colSpan={6} className="admin-empty">🎉 Moderation queue is clear.</td></tr>
                        ) : replies.data.map(reply => (
                            <tr key={reply.id}>
                                <td style={{ maxWidth: 280 }}>
                                    <div style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {reply.body}
                                    </div>
                                </td>
                                <td style={{ fontSize: 13 }}>{reply.user?.name}</td>
                                <td style={{ fontSize: 12, color: 'var(--text3)', maxWidth: 180 }}>
                                    <a href={`/forum/${reply.topic?.slug}`} target="_blank"
                                        style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
                                        {reply.topic?.title?.slice(0, 40)}…
                                    </a>
                                </td>
                                <td>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: reply.ai_score >= 7 ? 'var(--coral)' : 'var(--text2)' }}>
                                        {reply.ai_score?.toFixed(1) || '—'}
                                    </span>
                                </td>
                                <td>{fmtDate(reply.updated_at)}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button onClick={() => action(reply.id, 'restore')} className="admin-action-btn green pop-on-active">Restore</button>
                                        <button onClick={() => action(reply.id, 'delete')}  className="admin-action-btn red pop-on-active">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <AdminPagination data={replies} />
            </div>
        </AdminLayout>
    );
}