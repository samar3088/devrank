import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminFilterBar, AdminPagination, fmtDate } from '@/Pages/Admin/AdminShared';

export default function AdminCompanies() {
    const { companies, filters, stats } = usePage().props;

    function toggle(id) {
        router.post(`/admin/companies/${id}/toggle`, {}, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Manage Companies" stats={stats}>
            <div className="admin-page-header">
                <div><h1>Companies</h1><p>{companies.total} registered companies</p></div>
            </div>

            <AdminFilterBar route="/admin/companies" filters={filters} placeholder="Search by name or email..."
                selectName="status" selectOptions={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead><tr><th>Company</th><th>Email</th><th>Jobs Posted</th><th>Interests Sent</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {companies.data.length === 0 ? (
                            <tr><td colSpan={7} className="admin-empty">No companies found.</td></tr>
                        ) : companies.data.map(c => (
                            <tr key={c.id}>
                                <td>
                                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.company_name || c.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.industry || '—'}</div>
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{c.email}</td>
                                <td><span style={{ fontWeight: 600 }}>{c.job_listings_count || 0}</span></td>
                                <td><span style={{ fontWeight: 600 }}>{c.sent_interests_count || 0}</span></td>
                                <td>{fmtDate(c.created_at)}</td>
                                <td>
                                    <span className={`admin-badge admin-badge-${c.is_active ? 'green' : 'red'}`}>
                                        {c.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <a href={`/company/${c.id}`} target="_blank" className="admin-action-btn">View</a>
                                        <button onClick={() => toggle(c.id)} className={`admin-action-btn ${c.is_active ? 'red' : 'green'}`}>
                                            {c.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <AdminPagination data={companies} />
            </div>
        </AdminLayout>
    );
}