import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import MainLayout from '@/Layouts/MainLayout';

export default function MockInterviewIndex() {
    const { options, past, aiEnabled } = usePage().props;
    const form = useForm({ company_name: '', role: '' });

    const roles = useMemo(
        () => options.find(o => o.company === form.data.company_name)?.roles ?? [],
        [options, form.data.company_name]
    );

    function submit(e) {
        e.preventDefault();
        form.post('/mock-interview');
    }

    return (
        <MainLayout title="Mock Interview">
            <Head title="AI Mock Interview" />
            <div className="container" data-reveal-stagger="80" style={{ paddingTop: 36, paddingBottom: 80, maxWidth: 860 }}>
                <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>🎤 Mock Interview</h1>
                <p style={{ color: 'var(--text3)', marginBottom: 24 }}>
                    Practise the <strong>real rounds companies actually run</strong> — built from candidate reports on the
                    interview board.{' '}
                    {aiEnabled
                        ? 'The AI asks questions and gives you scored feedback.'
                        : 'Prep mode: real questions + tips from the board (AI feedback is off).'}
                </p>

                {/* Start a mock */}
                <div className="dash-card" data-reveal style={{ marginBottom: 24 }}>
                    <div className="dash-card-header"><h4>Start a session</h4></div>
                    <form onSubmit={submit} style={{ display: 'grid', gap: 14, marginTop: 8 }}>
                        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <label className="form-label" style={{ fontSize: 12 }}>Company</label>
                                <select className="form-input" value={form.data.company_name}
                                    onChange={e => { form.setData('company_name', e.target.value); form.setData('role', ''); }}>
                                    <option value="">General practice (any company)</option>
                                    {options.map(o => (
                                        <option key={o.company} value={o.company}>{o.company} ({o.reviews} report{o.reviews === 1 ? '' : 's'})</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <label className="form-label" style={{ fontSize: 12 }}>Role</label>
                                {roles.length > 0 ? (
                                    <select className="form-input" value={form.data.role} onChange={e => form.setData('role', e.target.value)}>
                                        <option value="">Any role</option>
                                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                ) : (
                                    <input className="form-input" placeholder="e.g. Backend Engineer" value={form.data.role}
                                        onChange={e => form.setData('role', e.target.value)} />
                                )}
                            </div>
                        </div>
                        <div>
                            <button type="submit" className="btn btn-primary pop-on-active" disabled={form.processing}>
                                {form.processing ? 'Preparing your questions…' : 'Start mock interview →'}
                            </button>
                            {aiEnabled && <span style={{ fontSize: 12, color: 'var(--text4)', marginLeft: 10 }}>Questions are generated to match this company’s real rounds.</span>}
                        </div>
                    </form>
                </div>

                {/* Past sessions */}
                <div className="dash-card" data-reveal>
                    <div className="dash-card-header"><h4>Your past sessions</h4></div>
                    {past.length === 0 ? (
                        <div className="dash-empty">No sessions yet — start one above.</div>
                    ) : (
                        <div>
                            {past.map(m => (
                                <Link key={m.id} href={`/mock-interview/${m.id}`} className="app-row hover-raise" style={{ alignItems: 'center', textDecoration: 'none' }}>
                                    <span style={{ fontSize: 18 }}>🎤</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{m.company_name || 'General practice'}{m.role ? ` · ${m.role}` : ''}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                                            {m.status === 'completed'
                                                ? (m.ai_graded ? `Scored ${m.overall_score}/100` : 'Completed (prep mode)')
                                                : 'In progress'}
                                        </div>
                                    </div>
                                    <span className="btn-sm btn-outline-sm">{m.status === 'completed' ? 'Review' : 'Continue'} →</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
