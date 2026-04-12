import { Head, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function AdminDashboard() {
    const { auth, stats } = usePage().props;

    return (
        <MainLayout>
            <Head title="Admin Dashboard" />
            <div className="page-container">
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ color: 'var(--text3)' }}>
                        Welcome back, {auth.user.name}!
                        <span style={{
                            marginLeft: '12px',
                            background: 'var(--violet-soft)',
                            border: '1px solid var(--violet-border)',
                            color: 'var(--violet-bright)',
                            padding: '2px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                        }}>
                            {auth.user.roles[0]}
                        </span>
                    </p>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px',
                    marginBottom: '32px',
                }}>
                    <StatCard label="Total Users" value={stats?.total_users || 0} />
                    <StatCard label="Candidates" value={stats?.total_candidates || 0} color="var(--emerald)" />
                    <StatCard label="Companies" value={stats?.total_companies || 0} color="var(--champagne)" />
                    <StatCard label="Active Jobs" value={stats?.active_jobs || 0} color="var(--violet-bright)" />
                    <StatCard label="Total Topics" value={stats?.total_topics || 0} />
                    <StatCard label="Total Jobs" value={stats?.total_jobs || 0} />
                    <StatCard label="Applications" value={stats?.total_applications || 0} />
                    <StatCard label="Pending Interests" value={stats?.pending_interests || 0} color="var(--champagne)" />
                </div>

                <p style={{ color: 'var(--text3)' }}>
                    Full admin panel with user management, moderation, and analytics coming soon.
                </p>
            </div>
        </MainLayout>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '22px 24px',
        }}>
            <div style={{
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: 'var(--text3)',
                marginBottom: '8px',
            }}>
                {label}
            </div>
            <div style={{
                fontSize: '2.1rem',
                fontWeight: '800',
                color: color || 'var(--text)',
                lineHeight: '1',
                letterSpacing: '-0.04em',
            }}>
                {value}
            </div>
        </div>
    );
}