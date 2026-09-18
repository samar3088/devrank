import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import CompanyLayout from '@/Layouts/CompanyLayout';
import CountUp from '@/Components/CountUp';

const STATUS_LABELS = {
    applied: 'Applied',
    reviewing: 'Reviewing',
    shortlisted: 'Shortlisted',
    interview: 'Interview',
    offered: 'Offered',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
};

export default function Applicants() {
    const { job, applicants, statuses, slaDays, slaOverdue, awaitingCount } = usePage().props;

    const header = (
        <div className="dash-header">
            <div className="dash-header-left">
                <h1 style={{ fontSize: '2rem' }}>Applicants</h1>
                <p>
                    <Link href="/company/jobs" className="link-underline">My Jobs</Link>
                    {' · '}{job.title} · <span style={{ textTransform: 'capitalize' }}>{job.status}</span>
                </p>
            </div>
            <div className="dash-header-actions">
                <Link href={`/company/jobs/${job.id}/edit`} className="btn-sm btn-outline-sm pop-on-active">Edit Job</Link>
                <Link href={`/jobs/${job.slug}`} className="btn-sm btn-primary-sm pop-on-active">View Public Post</Link>
            </div>
        </div>
    );

    return (
        <CompanyLayout fullWidthHeader={header}>
            <Head title={`Applicants · ${job.title}`} />

            <div className="dash-card" data-reveal>
                <div className="dash-card-header">
                    <h4><CountUp end={applicants.length} /> {applicants.length === 1 ? 'Applicant' : 'Applicants'}</h4>
                    <span style={{ fontSize: 13, color: 'var(--text3)' }}>Move candidates through your hiring pipeline</span>
                </div>

                {(awaitingCount > 0 || slaOverdue > 0) && (
                    <div
                        data-reveal="fade"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                            margin: '4px 0 16px', padding: '10px 14px', borderRadius: 10,
                            fontSize: 13, lineHeight: 1.5,
                            background: slaOverdue > 0 ? 'rgba(239,68,68,.08)' : 'rgba(245,158,11,.08)',
                            border: `1px solid ${slaOverdue > 0 ? 'rgba(239,68,68,.25)' : 'rgba(245,158,11,.25)'}`,
                            color: 'var(--text2)',
                        }}
                    >
                        <span>{slaOverdue > 0 ? '⏰' : '📥'}</span>
                        <span>
                            {awaitingCount > 0 && <><strong>{awaitingCount}</strong> awaiting a first response.</>}
                            {slaOverdue > 0 && (
                                <> <strong style={{ color: 'var(--rose, #ef4444)' }}>{slaOverdue}</strong> past your{' '}
                                {slaDays}-day response SLA — unanswered applicants lower your <strong>trust score</strong>.</>
                            )}
                            {slaOverdue === 0 && awaitingCount > 0 && <> Respond within {slaDays} days to protect your trust score.</>}
                        </span>
                    </div>
                )}

                {applicants.length > 0 ? (
                    <div data-reveal-stagger="55">
                        {applicants.map((a) => (
                            <ApplicantRow key={a.id} a={a} statuses={statuses} />
                        ))}
                    </div>
                ) : (
                    <div className="dash-empty">
                        No applications yet. Once candidates apply to <strong>{job.title}</strong>, they’ll appear here.
                    </div>
                )}
            </div>
        </CompanyLayout>
    );
}

function ApplicantRow({ a, statuses }) {
    const c = a.candidate || {};
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(a.status);
    const [reason, setReason] = useState(a.rejection_reason || '');
    const [saving, setSaving] = useState(false);

    function submit(newStatus, rejectionReason) {
        setSaving(true);
        router.put(
            `/company/applications/${a.id}/status`,
            { status: newStatus, rejection_reason: rejectionReason ?? null },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            }
        );
    }

    function onStatusChange(e) {
        const next = e.target.value;
        setStatus(next);
        if (next === 'rejected') {
            setOpen(true); // reveal reason box, wait for confirm
        } else {
            submit(next, null);
        }
    }

    return (
        <div className="app-row" data-reveal="fade" style={{ flexWrap: 'wrap' }}>
            <div className="app-rank-badge">{c.rank_score > 0 ? `#${Math.max(1, Math.ceil(c.rank_score / 500))}` : '—'}</div>
            <div className="app-avatar">{c.initials || '?'}</div>

            <div className="app-info">
                <div className="app-name">
                    <Link href={`/candidate/${c.id}`} className="link-underline">{c.name}</Link>
                </div>
                <div className="app-meta">
                    {c.headline ? `${c.headline} · ` : ''}{c.location || 'Location N/A'} · applied {a.applied_at}
                    {a.sla_overdue && (
                        <span style={{ marginLeft: 8, color: 'var(--rose, #ef4444)', fontWeight: 600 }} title="Past the response SLA — hurting your trust score">
                            ⏰ overdue
                        </span>
                    )}
                    {a.awaiting_response && !a.sla_overdue && (
                        <span style={{ marginLeft: 8, color: 'var(--amber, #f59e0b)', fontWeight: 600 }} title="Awaiting your first response">
                            ● awaiting response
                        </span>
                    )}
                </div>
            </div>

            <div className="app-right" style={{ gap: 10 }}>
                <span className="app-score">{(c.rank_score || 0).toLocaleString()} pts</span>
                <span title="AI-integrity human score" style={{ fontSize: 12, color: 'var(--emerald)' }}>{Math.round(c.human_score || 0)}% human</span>

                {a.resume_path ? (
                    <a href={`/storage/${a.resume_path}`} target="_blank" rel="noopener noreferrer" className="btn-sm btn-outline-sm pop-on-active">Résumé ↗</a>
                ) : (
                    <span style={{ fontSize: 12, color: 'var(--text4)' }}>No résumé</span>
                )}

                <select
                    id={`status-${a.id}`}
                    className="form-input"
                    value={status}
                    onChange={onStatusChange}
                    disabled={saving}
                    style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
                >
                    {statuses.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                    ))}
                </select>

                {a.cover_letter && (
                    <button type="button" className="btn-sm btn-ghost pop-on-active" onClick={() => setOpen((o) => !o)}>
                        {open ? 'Hide' : 'Cover letter'}
                    </button>
                )}
            </div>

            {open && (
                <div style={{ flexBasis: '100%', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    {a.cover_letter && (
                        <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: status === 'rejected' ? 16 : 0 }}>
                            {a.cover_letter}
                        </p>
                    )}
                    {status === 'rejected' && (
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 240 }}>
                                <textarea
                                    id={`reason-${a.id}`}
                                    className="form-input"
                                    placeholder="Rejection reason (shown to help the candidate improve) — required, min 10 characters"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={2}
                                    style={{ width: '100%' }}
                                    aria-invalid={reason.trim().length > 0 && reason.trim().length < 10}
                                />
                                <span style={{ fontSize: 12, color: 'var(--text4)' }}>
                                    {reason.trim().length < 10
                                        ? `A reason is required (${reason.trim().length}/10 characters).`
                                        : 'Thanks — transparent rejections keep your trust score healthy.'}
                                </span>
                            </div>
                            <button
                                type="button"
                                className="btn-sm btn-danger pop-on-active"
                                disabled={saving || reason.trim().length < 10}
                                onClick={() => submit('rejected', reason.trim())}
                            >
                                Confirm rejection
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
