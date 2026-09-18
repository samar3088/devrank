import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

function formatSalary(amount, currency, period) {
    if (amount == null) return null;
    let str;
    try {
        str = new Intl.NumberFormat(undefined, {
            style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        str = `${currency || ''} ${Number(amount).toLocaleString()}`.trim();
    }
    return `${str} / ${period === 'monthly' ? 'mo' : 'yr'}`;
}

const STATUS_BADGE = {
    pending:  { label: 'Awaiting your confirmation', color: 'var(--champagne)' },
    verified: { label: 'Verified ✓', color: 'var(--emerald, #10b981)' },
    declined: { label: 'Declined', color: 'var(--text3)' },
};

export default function HiresIndex() {
    const { hires } = usePage().props;

    return (
        <MainLayout>
            <Head title="My Hires" />
            <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ marginBottom: 4 }}>My Hires</h1>
                    <p style={{ color: 'var(--text3)', fontSize: 14, margin: 0 }}>
                        Confirm the roles you were hired for. Verified hires build a trusted track record —
                        and you can optionally help others by sharing your offer anonymously in{' '}
                        <Link href="/salaries" className="link-underline">salary transparency</Link>.
                    </p>
                </div>

                {hires.length > 0 ? (
                    <div data-reveal-stagger="60">
                        {hires.map((h) => <HireRow key={h.id} h={h} />)}
                    </div>
                ) : (
                    <div className="dash-card dash-empty" data-reveal>
                        No hires yet. When a company marks you as hired, it’ll appear here for you to confirm.
                    </div>
                )}

                <FullFooter />
            </div>
        </MainLayout>
    );
}

function HireRow({ h }) {
    const [busy, setBusy] = useState(false);
    const [share, setShare] = useState(false);
    const badge = STATUS_BADGE[h.status] || STATUS_BADGE.pending;
    const salary = formatSalary(h.offered_salary, h.salary_currency, h.salary_period);

    function doConfirm() {
        setBusy(true);
        router.post(`/hires/${h.id}/confirm`, { share_salary: share }, {
            preserveScroll: true, onFinish: () => setBusy(false),
        });
    }

    function doDecline() {
        if (!window.confirm('Mark this hire as not confirmed? The company will be notified and the application returns to “offered”.')) return;
        setBusy(true);
        router.post(`/hires/${h.id}/decline`, {}, { preserveScroll: true, onFinish: () => setBusy(false) });
    }

    return (
        <div className="dash-card hover-lift" data-reveal="fade" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 28 }}>🎉</div>
                <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{h.role_title}</div>
                    <div style={{ color: 'var(--text3)', fontSize: 13, marginTop: 2 }}>
                        <Link href={`/company/${h.company_id}`} className="link-underline">{h.company}</Link>
                        {' · recorded '}{h.recorded_at}
                        {salary && <> · <strong style={{ color: 'var(--text2)' }}>{salary}</strong></>}
                        {h.starts_on && <> · starts {h.starts_on}</>}
                    </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: badge.color, whiteSpace: 'nowrap' }}>{badge.label}</span>
            </div>

            {h.status === 'pending' && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    {salary && (
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text2)', cursor: 'pointer', marginBottom: 12 }}>
                            <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} style={{ marginTop: 3 }} />
                            <span>
                                Share this offer <strong>anonymously</strong> to help the community — it’s only ever shown
                                as part of an aggregate (medians &amp; ranges), never on its own. You can’t be identified from it.
                            </span>
                        </label>
                    )}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-primary btn-sm pop-on-active" disabled={busy} onClick={doConfirm}>
                            {busy ? 'Saving…' : 'Confirm hire ✓'}
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={doDecline} style={{ color: 'var(--rose, #ef4444)' }}>
                            This didn’t happen
                        </button>
                    </div>
                </div>
            )}

            {h.status === 'verified' && salary && h.salary_shared && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text3)' }}>
                    ✅ Contributing anonymously to salary transparency. <Link href="/salaries" className="link-underline">View data →</Link>
                </div>
            )}
        </div>
    );
}
