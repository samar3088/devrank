import { Head, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function CompanyDashboard() {
    const { auth, stats } = usePage().props;

    return (
        <MainLayout>
            <Head title="Company Dashboard" />
            <div className="page-container">
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
                        Company Dashboard
                    </h1>
                    <p style={{ color: 'var(--text3)' }}>
                        Welcome back, {auth.user.name}!
                        <span style={{
                            marginLeft: '12px',
                            background: 'rgba(240,201,110,.09)',
                            border: '1px solid rgba(240,201,110,.25)',
                            color: 'var(--champagne)',
                            padding: '2px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                        }}>
                            Company
                        </span>
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

                <p style={{ color: 'var(--text3)' }}>
                    Job management, candidate pipeline, and outreach tools coming soon.
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