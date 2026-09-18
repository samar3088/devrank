import { Head, Link, useForm, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function MockInterviewShow() {
    const { mock, aiEnabled, prep } = usePage().props;
    const done = mock.status === 'completed';

    const form = useForm({ answers: mock.transcript.map(t => t.answer || '') });

    function submit(e) {
        e.preventDefault();
        form.post(`/mock-interview/${mock.id}/submit`);
    }

    const scoreColor = (s) => (s >= 7 ? 'var(--emerald, #10b981)' : s >= 4 ? 'var(--amber, #f59e0b)' : 'var(--rose, #ef4444)');

    return (
        <MainLayout title="Mock Interview">
            <Head title={`Mock Interview · ${mock.company_name || 'Practice'}`} />
            <div className="container" data-reveal-stagger="80" style={{ paddingTop: 36, paddingBottom: 80, maxWidth: 860 }}>
                <Link href="/mock-interview" className="link-underline" style={{ fontSize: 14, color: 'var(--text3)' }}>← All sessions</Link>
                <h1 style={{ fontSize: '1.8rem', margin: '10px 0 2px' }}>🎤 {mock.company_name || 'General practice'}</h1>
                <p style={{ color: 'var(--text3)', marginBottom: 20 }}>{mock.role || 'Any role'} · {mock.transcript.length} questions</p>

                {/* Completed summary */}
                {done && mock.ai_graded && (
                    <div className="dash-card" data-reveal style={{ marginBottom: 20, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: scoreColor((mock.overall_score || 0) / 10) }}>{mock.overall_score}<span style={{ fontSize: '1rem', color: 'var(--text3)' }}>/100</span></div>
                            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Readiness</div>
                        </div>
                        <p style={{ flex: 1, minWidth: 240, color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}>{mock.summary}</p>
                    </div>
                )}
                {done && !mock.ai_graded && (
                    <div className="dash-card dash-empty" data-reveal style={{ marginBottom: 20 }}>
                        Submitted in prep mode (AI feedback off). Your answers are saved below — compare them against the candidate tips.
                    </div>
                )}

                {/* Questions */}
                <form onSubmit={submit}>
                    {mock.transcript.map((t, i) => (
                        <div key={i} className="dash-card" data-reveal style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--cyan)' }}>{t.round_type}</span>
                                {done && mock.ai_graded && t.score != null && (
                                    <span style={{ fontWeight: 700, color: scoreColor(t.score) }}>{t.score}/10</span>
                                )}
                            </div>
                            <div style={{ fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>Q{i + 1}. {t.question}</div>

                            {done ? (
                                <>
                                    <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, background: 'var(--surface, #0f172a)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                                        {t.answer || <span style={{ color: 'var(--text4)' }}>(no answer)</span>}
                                    </div>
                                    {t.feedback && (
                                        <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text2)', borderLeft: '3px solid var(--cyan)', paddingLeft: 12 }}>
                                            <strong>Feedback:</strong> {t.feedback}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <textarea
                                    className="form-input"
                                    rows={5}
                                    placeholder="Type your answer as you would say it in the interview…"
                                    value={form.data.answers[i]}
                                    onChange={e => {
                                        const a = [...form.data.answers];
                                        a[i] = e.target.value;
                                        form.setData('answers', a);
                                    }}
                                />
                            )}
                        </div>
                    ))}

                    {!done && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                            <button type="submit" className="btn btn-primary pop-on-active" disabled={form.processing}>
                                {form.processing ? (aiEnabled ? 'Grading your answers…' : 'Submitting…') : 'Submit for feedback'}
                            </button>
                            {aiEnabled && <span style={{ fontSize: 12, color: 'var(--text4)' }}>The AI will score each answer + overall readiness.</span>}
                        </div>
                    )}
                </form>

                {/* Real candidate tips */}
                {prep?.tips?.length > 0 && (
                    <div className="dash-card" data-reveal style={{ marginTop: 24 }}>
                        <div className="dash-card-header"><h4>💡 Tips from real candidates</h4></div>
                        <ul style={{ margin: '8px 0 0', paddingLeft: 18, color: 'var(--text2)', fontSize: 14, lineHeight: 1.8 }}>
                            {prep.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
