import { Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminDashboard() {
    const { stats } = usePage().props;

    const statCards = [
        { label: 'Total Candidates', value: stats.total_candidates, sub: `+${stats.new_candidates_week} this week`, color: 'var(--violet-bright)' },
        { label: 'Total Companies',  value: stats.total_companies,  sub: `+${stats.new_companies_week} this week`, color: 'var(--cyan)' },
        { label: 'Active Jobs',      value: stats.active_jobs,      sub: `${stats.total_jobs} total posted`,        color: 'var(--champagne)' },
        { label: 'Applications',     value: stats.total_applications, sub: 'all time',                              color: 'var(--emerald)' },
        { label: 'Forum Topics',     value: stats.total_topics,     sub: 'all time',                               color: 'var(--text2)' },
        { label: 'Pending Tags',     value: stats.pending_tags,     sub: 'awaiting approval',                      color: stats.pending_tags > 0 ? 'var(--champagne)' : 'var(--text2)' },
        { label: 'Flagged Replies',  value: stats.flagged_replies,  sub: 'in moderation queue',                    color: stats.flagged_replies > 0 ? 'var(--coral)' : 'var(--text2)' },
    ];

    return (
        <AdminLayout title="Admin Dashboard" stats={stats}>
            <div className="admin-page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Platform overview — all roles, all activity.</p>
                </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                {statCards.map(s => (
                    <div key={s.label} className="admin-stat-card">
                        <div className="admin-stat-label">{s.label}</div>
                        <div className="admin-stat-value" style={{ color: s.color }}>
                            {s.value?.toLocaleString()}
                        </div>
                        <div className="admin-stat-sub">{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--text2)' }}>Quick Actions</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {stats.pending_tags > 0 && (
                        <Link href="/admin/tags" className="btn btn-sm btn-primary">
                            🏷️ Review {stats.pending_tags} Pending Tags
                        </Link>
                    )}
                    {stats.flagged_replies > 0 && (
                        <Link href="/admin/moderation" className="btn btn-sm" style={{ border: '1px solid var(--coral)', color: 'var(--coral)', borderRadius: 'var(--r)', padding: '5px 12px', fontSize: 12, textDecoration: 'none' }}>
                            🚨 Review {stats.flagged_replies} Flagged Replies
                        </Link>
                    )}
                    <Link href="/admin/users" className="btn btn-ghost btn-sm">👤 Manage Candidates</Link>
                    <Link href="/admin/companies" className="btn btn-ghost btn-sm">🏢 Manage Companies</Link>
                    <Link href="/admin/quiz" className="btn btn-ghost btn-sm">🎯 Manage Quizzes</Link>
                </div>
            </div>
        </AdminLayout>
    );
}
