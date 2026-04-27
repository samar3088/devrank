import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminFilterBar, AdminPagination, AdminBadge, fmtDate } from '@/Pages/Admin/AdminShared';

const STATUS_MAP = {
    true:  { label: 'Active',   cls: 'green' },
    false: { label: 'Inactive', cls: 'red' },
};

export default function AdminUsers() {
    const { users, filters, stats } = usePage().props;

    function toggle(userId) {
        router.post(`/admin/users/${userId}/toggle`, {}, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Manage Candidates" stats={stats}>
            <div className="admin-page-header">
                <div>
                    <h1>Candidates</h1>
                    <p>{users.total} registered candidates</p>
                </div>
            </div>

            <AdminFilterBar
                route="/admin/users"
                filters={filters}
                placeholder="Search by name or email..."
                selectName="status"
                selectOptions={[
                    { value: 'active',   label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                ]}
            />

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Candidate</th>
                            <th>Email</th>
                            <th>Rank Score</th>
                            <th>Joined</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.length === 0 ? (
                            <tr><td colSpan={6} className="admin-empty">No candidates found.</td></tr>
                        ) : users.data.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{user.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user.location || '—'}</div>
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{user.email}</td>
                                <td>
                                    <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>
                                        {user.total_rank_score?.toLocaleString() || 0}
                                    </span>
                                </td>
                                <td>{fmtDate(user.created_at)}</td>
                                <td>
                                    <AdminBadge value={String(user.is_active)} map={{
                                        'true':  { label: 'Active',   cls: 'green' },
                                        'false': { label: 'Inactive', cls: 'red' },
                                    }} />
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <a
                                            href={`/candidate/${user.id}`}
                                            target="_blank"
                                            className="admin-action-btn"
                                        >
                                            View
                                        </a>
                                        <button
                                            onClick={() => toggle(user.id)}
                                            className={`admin-action-btn ${user.is_active ? 'red' : 'green'}`}
                                        >
                                            {user.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <AdminPagination data={users} />
            </div>
        </AdminLayout>
    );
}
