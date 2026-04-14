import { Head, usePage, Link } from '@inertiajs/react';
import CompanyLayout from '@/Layouts/CompanyLayout';

export default function CompanyDashboard() {
    const { auth, stats } = usePage().props;

    return (
        <CompanyLayout>
            <Head title="Company Dashboard" />

            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
                    Dashboard
                </h1>
                <p style={{ color: 'var(--text3)' }}>
                    Welcome back, {auth.user.name}!
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px',
            }}>
                <StatCard label="Active Jobs" value={stats?.active_jobs || 0} color="var(--emerald)" />
                <StatCard label="Total Applications" value={stats?.total_applications || 0} />
                <StatCard label="Interests Accepted" value={stats?.interests_accepted || 0} color="var(--violet-bright)" />
                <StatCard label="Outreach Remaining" value={stats?.monthly_outreach_remaining || 0} color="var(--champagne)" />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <Link href="/company/jobs" className="btn-sm btn-outline-sm">View My Jobs →</Link>
                <Link href="/company/jobs/create" className="btn-sm btn-primary-sm">+ Post New Job</Link>
            </div>
        </CompanyLayout>
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