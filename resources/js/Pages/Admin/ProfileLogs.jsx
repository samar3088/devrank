import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminFilterBar, AdminPagination, fmtDate } from '@/Pages/Admin/AdminShared';

export default function AdminProfileLogs() {
    const { logs, filters, stats } = usePage().props;

    return (
        <AdminLayout title="Profile Access Logs" stats={stats}>
            <div className="admin-page-header">
                <div>
                    <h1>Profile Access Logs</h1>
                    <p>Every company profile view is recorded here.</p>
                </div>
            </div>

            <AdminFilterBar route="/admin/profile-logs" filters={filters} placeholder="Search by company name..." />

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead><tr><th>Company</th><th>Candidate Viewed</th><th>Source</th><th>Date & Time</th></tr></thead>
                    <tbody>
                        {logs.data.length === 0 ? (
                            <tr><td colSpan={4} className="admin-empty">No profile views recorded yet.</td></tr>
                        ) : logs.data.map(log => (
                            <tr key={log.id}>
                                <td>
                                    <a href={`/company/${log.viewer_id}`} target="_blank"
                                        style={{ fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
                                        {log.viewer?.company_name || log.viewer?.name}
                                    </a>
                                </td>
                                <td>
                                    <a href={`/candidate/${log.profile_id}`} target="_blank"
                                        style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
                                        {log.profile?.name}
                                    </a>
                                </td>
                                <td>
                                    <span className={`admin-badge admin-badge-${log.source === 'interest_accept' ? 'violet' : 'gray'}`}>
                                        {log.source || 'direct'}
                                    </span>
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                                    {fmtDate(log.created_at)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <AdminPagination data={logs} />
            </div>
        </AdminLayout>
    );
}