import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';
import CountUp from '@/Components/CountUp';

function money(amount, currency) {
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency', currency: currency || 'INR',
            maximumFractionDigits: 0, notation: 'compact',
        }).format(amount);
    } catch {
        return `${currency || ''} ${Number(amount).toLocaleString()}`.trim();
    }
}

export default function SalariesIndex() {
    const { data } = usePage().props;

    const header = (
        <div style={{ marginBottom: 24 }}>
            <h1 style={{ marginBottom: 4 }}>💰 Salary transparency</h1>
            <p style={{ color: 'var(--text3)', fontSize: 14, margin: 0, maxWidth: 680 }}>
                Real compensation from <strong>verified hires</strong> on DevRank — confirmed by both the company and the
                candidate. Figures are aggregate-only and never shown individually.
            </p>
        </div>
    );

    if (!data.available) {
        return (
            <MainLayout>
                <Head title="Salary transparency" />
                <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
                    {header}
                    <div className="dash-card" data-reveal style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                        <h3 style={{ marginBottom: 8 }}>Not enough data yet</h3>
                        <p style={{ color: 'var(--text3)', fontSize: 14, maxWidth: 520, margin: '0 auto' }}>
                            We publish salary bands only once at least <strong>{data.min_sample}</strong> candidates have
                            confirmed a hire <em>and</em> opted into sharing — so no single person’s offer can ever be
                            identified. {data.verified_count > 0
                                ? `${data.verified_count} hire${data.verified_count === 1 ? '' : 's'} verified so far.`
                                : ''}
                        </p>
                    </div>
                    <FullFooter />
                </div>
            </MainLayout>
        );
    }

    const cur = data.currency;

    return (
        <MainLayout>
            <Head title="Salary transparency" />
            <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
                {header}

                {/* Overall */}
                <div className="dash-card hover-lift" data-reveal style={{ marginBottom: 20 }}>
                    <div className="dash-card-header">
                        <h4>Overall — {cur}</h4>
                        <span style={{ fontSize: 13, color: 'var(--text3)' }}>
                            from <CountUp end={data.shared_count} /> shared verified {data.shared_count === 1 ? 'offer' : 'offers'}
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 8 }}>
                        <Stat label="Median (annual)" value={money(data.overall.median, cur)} big color="var(--cyan)" />
                        <Stat label="Typical range (25th–75th)" value={`${money(data.overall.p25, cur)} – ${money(data.overall.p75, cur)}`} color="var(--text)" />
                        <Stat label="Full range" value={`${money(data.overall.min, cur)} – ${money(data.overall.max, cur)}`} color="var(--text2)" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <Breakdown title="By experience level" rows={data.by_level} cur={cur} min={data.min_sample} />
                    <Breakdown title="By role" rows={data.by_role} cur={cur} min={data.min_sample} />
                </div>

                <p style={{ fontSize: 12, color: 'var(--text4)', marginTop: 20, maxWidth: 720 }}>
                    Monthly offers are annualised (× 12). Buckets with fewer than {data.min_sample} shared offers are hidden to
                    protect privacy. Are you hired through DevRank?{' '}
                    <Link href="/hires" className="link-underline">Confirm your hire</Link> and choose to contribute anonymously.
                </p>

                <FullFooter />
            </div>
        </MainLayout>
    );
}

function Breakdown({ title, rows, cur, min }) {
    return (
        <div className="dash-card hover-lift" data-reveal>
            <h4 style={{ marginBottom: 14 }}>{title}</h4>
            {rows && rows.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {rows.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 10, borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
                                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{r.count} offers · {money(r.p25, cur)}–{money(r.p75, cur)}</div>
                            </div>
                            <div style={{ fontWeight: 800, color: 'var(--cyan)', whiteSpace: 'nowrap' }}>{money(r.median, cur)}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ fontSize: 13, color: 'var(--text3)', padding: '16px 0' }}>
                    No group has reached {min} shared offers yet.
                </div>
            )}
        </div>
    );
}

function Stat({ label, value, sub, big, color }) {
    return (
        <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: big ? '1.6rem' : '1.05rem', fontWeight: 800, color: color ?? 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</div>
            {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>}
        </div>
    );
}
