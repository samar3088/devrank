import { usePage } from '@inertiajs/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminAnalytics() {
    const { data } = usePage().props;
    const { weeks, top_tags, totals } = data;

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text2)' }}>{label}</div>
                {payload.map((p, i) => (
                    <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>
                ))}
            </div>
        );
    };

    return (
        <AdminLayout title="Analytics">
            <div className="admin-page-header">
                <div>
                    <h1>Analytics</h1>
                    <p>Platform growth and activity — last 8 weeks</p>
                </div>
            </div>

            {/* ── Platform Totals ──────────────────────────────── */}
            <div className="admin-stats-grid" style={{ marginBottom: 32 }}>
                {[
                    { label: 'Total Candidates',   value: totals.candidates,    color: 'var(--violet-bright)' },
                    { label: 'Total Companies',    value: totals.companies,     color: 'var(--cyan)' },
                    { label: 'Active Jobs',        value: totals.jobs_active,   color: 'var(--champagne)' },
                    { label: 'Total Applications', value: totals.applications,  color: 'var(--emerald)' },
                    { label: 'Forum Topics',       value: totals.topics,        color: 'var(--text2)' },
                    { label: 'Forum Replies',      value: totals.replies,       color: 'var(--text2)' },
                    { label: 'Quiz Attempts',      value: totals.quiz_attempts, color: 'var(--text2)' },
                    { label: 'AI Flagged',         value: totals.ai_flagged,    color: totals.ai_flagged > 0 ? 'var(--coral)' : 'var(--text3)' },
                ].map(s => (
                    <div key={s.label} className="admin-stat-card">
                        <div className="admin-stat-label">{s.label}</div>
                        <div className="admin-stat-value" style={{ color: s.color, fontSize: '1.5rem' }}>
                            {s.value?.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── User Growth ──────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <ChartCard title="New Registrations / Week">
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={weeks}>
                            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                            <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                            <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="candidates" name="Candidates" stroke="var(--violet-bright)" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="companies"  name="Companies"  stroke="var(--cyan)"          strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                    <ChartLegend items={[
                        { color: 'var(--violet-bright)', label: 'Candidates' },
                        { color: 'var(--cyan)', label: 'Companies' },
                    ]} />
                </ChartCard>

                <ChartCard title="Job Applications / Week">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeks}>
                            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                            <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                            <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="applications" name="Applications" fill="var(--emerald)" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Forum Topics / Week">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeks}>
                            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                            <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                            <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="topics" name="Topics" fill="var(--violet-bright)" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Quiz Attempts / Week">
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={weeks}>
                            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                            <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                            <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="quiz_attempts" name="Attempts" stroke="var(--champagne)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* ── Top Tags ─────────────────────────────────────── */}
            <div className="admin-table-wrap">
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>
                    Top 5 Tags by Forum Activity
                </div>
                <table className="admin-table">
                    <thead>
                        <tr><th>#</th><th>Tag</th><th>Topics</th><th>Activity Bar</th></tr>
                    </thead>
                    <tbody>
                        {top_tags.length === 0 ? (
                            <tr><td colSpan={4} className="admin-empty">No tag data yet.</td></tr>
                        ) : top_tags.map((tag, i) => {
                            const maxCount = top_tags[0]?.topic_count ?? 1;
                            const pct      = Math.round((tag.topic_count / maxCount) * 100);
                            return (
                                <tr key={tag.name}>
                                    <td style={{ color: 'var(--text3)', fontWeight: 700 }}>#{i + 1}</td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: 'var(--violet-bright)' }}>#{tag.name}</span>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>{tag.topic_count}</td>
                                    <td style={{ width: '40%' }}>
                                        <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 999, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--violet-bright)', borderRadius: 999 }} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}

function ChartCard({ title, children }) {
    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{title}</div>
            {children}
        </div>
    );
}

function ChartLegend({ items }) {
    return (
        <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12 }}>
            {items.map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                    <span style={{ color: 'var(--text3)' }}>{item.label}</span>
                </div>
            ))}
        </div>
    );
}
