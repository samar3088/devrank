import { Head, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function CandidateDashboard() {
    const { auth, stats } = usePage().props;

    return (
        <MainLayout>
            <Head title="My Dashboard" />
            <div className="page-container">
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
                        My Dashboard
                    </h1>
                    <p style={{ color: 'var(--text3)' }}>
                        Welcome back, {auth.user.name}!
                        <span style={{
                            marginLeft: '12px',
                            background: 'rgba(52,235,160,.09)',
                            border: '1px solid rgba(52,235,160,.22)',
                            color: 'var(--emerald)',
                            padding: '2px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                        }}>
                            Candidate
                        </span>
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px',
                    marginBottom: '32px',
                }}>
                    <StatCard label="Rank Score" value={stats?.rank_score || 0} color="var(--violet-bright)" />
                    <StatCard label="Human Score" value={`${stats?.human_score || 0}%`} color="var(--emerald)" />
                    <StatCard label="Topics" value={stats?.total_topics || 0} />
                    <StatCard label="Replies" value={stats?.total_replies || 0} />
                    <StatCard label="Likes Received" value={stats?.total_likes_received || 0} color="var(--champagne)" />
                    <StatCard label="Applications" value={stats?.applications_sent || 0} />
                    <StatCard label="Interest Requests" value={stats?.interests_received || 0} />
                    <StatCard label="Apps Remaining" value={stats?.monthly_applications_remaining || 0} color="var(--emerald)" />
                </div>

                <p style={{ color: 'var(--text3)' }}>
                    Your forum activity, rank history, and application tracking coming soon.
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