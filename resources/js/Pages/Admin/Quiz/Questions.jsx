import { useForm, usePage, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import LoadingButton from '@/Components/LoadingButton';

const EMPTY_OPTION = { option_text: '', is_correct: false };
const DEFAULT_OPTIONS = [
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
];

export default function AdminQuizQuestions() {
    const { quiz } = usePage().props;
    const [showForm, setShowForm] = useState(false);

    const form = useForm({
        type:         'mcq',
        body:         '',
        marks:        10,
        language:     'javascript',
        starter_code: '',
        explanation:  '',
        options:      DEFAULT_OPTIONS.map(o => ({ ...o })),
    });

    function setOption(index, field, value) {
        const opts = [...form.data.options];
        opts[index] = { ...opts[index], [field]: value };
        // If marking as correct, unmark others
        if (field === 'is_correct' && value === true) {
            opts.forEach((o, i) => { if (i !== index) o.is_correct = false; });
        }
        form.setData('options', opts);
    }

    function addOption() {
        if (form.data.options.length >= 4) return;
        form.setData('options', [...form.data.options, { ...EMPTY_OPTION }]);
    }

    function removeOption(index) {
        if (form.data.options.length <= 2) return;
        form.setData('options', form.data.options.filter((_, i) => i !== index));
    }

    function submit(e) {
        e.preventDefault();
        form.post(`/admin/quiz/${quiz.id}/questions`, {
            onSuccess: () => {
                form.reset();
                form.setData('options', DEFAULT_OPTIONS.map(o => ({ ...o })));
                setShowForm(false);
            },
            preserveScroll: true,
        });
    }

    function deleteQuestion(questionId) {
        if (!confirm('Delete this question? This cannot be undone.')) return;
        router.delete(`/admin/quiz/${quiz.id}/questions/${questionId}`, { preserveScroll: true });
    }

    const isMcq = form.data.type === 'mcq';

    return (
        <AdminLayout title={`Questions — ${quiz.title}`}>
            <div className="admin-page-header">
                <div>
                    <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>
                        <Link href="/admin/quiz" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Quizzes</Link>
                        {' '} › <Link href={`/admin/quiz/${quiz.id}/edit`} style={{ color: 'var(--text3)', textDecoration: 'none' }}>{quiz.title}</Link>
                        {' '} › Questions
                    </div>
                    <h1>Questions</h1>
                    <p>{quiz.questions.length} questions · {quiz.total_marks} total marks</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
                    {showForm ? '× Cancel' : '+ Add Question'}
                </button>
            </div>

            {/* Add question form */}
            {showForm && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--violet-border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20, color: 'var(--violet-bright)' }}>
                        New Question
                    </div>
                    <form onSubmit={submit}>

                        {/* Type toggle */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                            {['mcq', 'coding'].map(t => (
                                <button key={t} type="button"
                                    onClick={() => form.setData('type', t)}
                                    style={{
                                        padding: '7px 18px', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                        border: form.data.type === t ? '1px solid var(--violet-bright)' : '1px solid var(--border)',
                                        background: form.data.type === t ? 'color-mix(in srgb, var(--violet) 15%, transparent)' : 'transparent',
                                        color: form.data.type === t ? 'var(--violet-bright)' : 'var(--text3)',
                                    }}>
                                    {t === 'mcq' ? '📋 Multiple Choice' : '💻 Coding'}
                                </button>
                            ))}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Question Body <span style={{ color: 'var(--coral)' }}>*</span></label>
                            <textarea className={`form-input${form.errors.body ? ' is-error' : ''}`}
                                rows={4} placeholder="Write the question here..."
                                value={form.data.body}
                                onChange={e => form.setData('body', e.target.value)} />
                            {form.errors.body && <div className="form-error">{form.errors.body}</div>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isMcq ? '1fr' : '1fr 1fr', gap: 16 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Marks <span style={{ color: 'var(--coral)' }}>*</span></label>
                                <input type="number" className="form-input" min={1} max={100}
                                    value={form.data.marks}
                                    onChange={e => form.setData('marks', parseInt(e.target.value))} />
                            </div>
                            {!isMcq && (
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Language</label>
                                    <select className="form-select" value={form.data.language}
                                        onChange={e => form.setData('language', e.target.value)}>
                                        <option value="javascript">JavaScript</option>
                                        <option value="php">PHP</option>
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                        <option value="cpp">C++</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* MCQ options */}
                        {isMcq && (
                            <div style={{ marginTop: 20 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                                    Answer Options <span style={{ color: 'var(--coral)' }}>*</span>
                                    <span style={{ marginLeft: 8, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— mark one as correct</span>
                                </div>
                                {form.errors.options && <div className="form-error" style={{ marginBottom: 8 }}>{form.errors.options}</div>}
                                {form.data.options.map((opt, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <input
                                            type="radio"
                                            name="correct_option"
                                            checked={opt.is_correct}
                                            onChange={() => setOption(i, 'is_correct', true)}
                                            style={{ cursor: 'pointer', accentColor: 'var(--emerald)', width: 16, height: 16, flexShrink: 0 }}
                                            title="Mark as correct"
                                        />
                                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', width: 20, flexShrink: 0 }}>
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ flex: 1, marginBottom: 0 }}
                                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                            value={opt.option_text}
                                            onChange={e => setOption(i, 'option_text', e.target.value)}
                                        />
                                        {form.data.options.length > 2 && (
                                            <button type="button" onClick={() => removeOption(i)}
                                                style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {form.data.options.length < 4 && (
                                    <button type="button" onClick={addOption}
                                        style={{ fontSize: 12, color: 'var(--violet-bright)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginTop: 4 }}>
                                        + Add option
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Coding starter code */}
                        {!isMcq && (
                            <div className="form-group" style={{ marginTop: 16 }}>
                                <label className="form-label">Starter Code (optional)</label>
                                <textarea
                                    className="form-input"
                                    rows={5}
                                    placeholder={`// Starter code shown to candidate\nfunction solution() {\n  // your code here\n}`}
                                    value={form.data.starter_code}
                                    onChange={e => form.setData('starter_code', e.target.value)}
                                    style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
                                />
                            </div>
                        )}

                        {/* Explanation */}
                        <div className="form-group" style={{ marginTop: 8 }}>
                            <label className="form-label">Explanation (shown after attempt)</label>
                            <textarea className="form-input" rows={2}
                                placeholder="Explain the correct answer..."
                                value={form.data.explanation}
                                onChange={e => form.setData('explanation', e.target.value)} />
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                            <LoadingButton type="submit" className="btn btn-primary" loading={form.processing}>
                                Add Question
                            </LoadingButton>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Existing questions */}
            {quiz.questions.length === 0 ? (
                <div className="admin-empty">No questions yet. Click "+ Add Question" to start.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {quiz.questions.map((q, i) => (
                        <div key={q.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)' }}>Q{i + 1}</span>
                                        <span className={`admin-badge admin-badge-${q.type === 'mcq' ? 'cyan' : 'violet'}`}>
                                            {q.type === 'mcq' ? 'MCQ' : `Coding · ${q.language}`}
                                        </span>
                                        <span style={{ fontSize: 12, color: 'var(--champagne)', fontWeight: 600 }}>{q.marks} marks</span>
                                    </div>
                                    <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: q.options?.length ? 12 : 0 }}>
                                        {q.body}
                                    </div>
                                    {q.options?.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
                                            {q.options.map((opt, oi) => (
                                                <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                                                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: opt.is_correct ? 'var(--emerald)' : 'var(--surface2)', color: opt.is_correct ? '#000' : 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                                        {String.fromCharCode(65 + oi)}
                                                    </span>
                                                    <span style={{ color: opt.is_correct ? 'var(--emerald)' : 'var(--text2)', fontWeight: opt.is_correct ? 600 : 400 }}>
                                                        {opt.option_text}
                                                        {opt.is_correct && <span style={{ marginLeft: 6, fontSize: 11 }}>✓ Correct</span>}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {q.explanation && (
                                        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>
                                            💡 {q.explanation}
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => deleteQuestion(q.id)} className="admin-action-btn red" style={{ flexShrink: 0 }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Total marks summary */}
            {quiz.questions.length > 0 && (
                <div style={{ marginTop: 20, padding: '14px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text3)' }}>{quiz.questions.length} questions</span>
                    <span style={{ color: 'var(--champagne)', fontWeight: 700 }}>Total: {quiz.total_marks} marks</span>
                </div>
            )}
        </AdminLayout>
    );
}
