import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import MainLayout from '@/Layouts/MainLayout';

export default function QuizAttempt() {
    const { quiz, attemptId, attemptNumber } = usePage().props;
    const questions   = quiz.questions;
    const totalSeconds = quiz.time_limit_minutes * 60;

    const [currentIndex, setCurrentIndex]   = useState(0);
    const [answers, setAnswers]             = useState({});
    const [timeLeft, setTimeLeft]           = useState(totalSeconds);
    const [submitting, setSubmitting]       = useState(false);
    const [submitted, setSubmitted]         = useState({});
    const [aiFlagWarning, setAiFlagWarning] = useState(false);

    const pasteCount        = useRef({});
    const questionStartTime = useRef({});
    const startedAt         = useRef(Date.now());

    const currentQ = questions[currentIndex];

    // ── Timer ────────────────────────────────────────────────────
    useEffect(() => {
        if (timeLeft <= 0) { handleSubmitAll(); return; }
        const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft]);

    // Track time per question
    useEffect(() => {
        questionStartTime.current[currentQ.id] = Date.now();
    }, [currentIndex]);

    // ── Handlers ─────────────────────────────────────────────────
    function setOptionAnswer(questionId, optionId) {
        setAnswers(prev => ({ ...prev, [questionId]: { selectedOptionId: optionId, answerText: null } }));
    }

    function setCodeAnswer(questionId, code) {
        setAnswers(prev => ({ ...prev, [questionId]: { selectedOptionId: null, answerText: code ?? '' } }));
    }

    function handlePaste(questionId) {
        pasteCount.current[questionId] = (pasteCount.current[questionId] || 0) + 1;
        setAiFlagWarning(true);
        setTimeout(() => setAiFlagWarning(false), 4000);
    }

    // ── Submit single question answer ─────────────────────────────
    async function submitCurrentQuestion() {
        if (submitted[currentQ.id]) return true;

        const answer         = answers[currentQ.id] || {};
        const timeSpent      = Math.round((Date.now() - (questionStartTime.current[currentQ.id] || Date.now())) / 1000);
        const pasteCountForQ = pasteCount.current[currentQ.id] || 0;

        setSubmitting(true);
        try {
            const res = await fetch(`/quiz/attempt/${attemptId}/answer`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrf() },
                body: JSON.stringify({
                    question_id:        currentQ.id,
                    selected_option_id: answer.selectedOptionId ?? null,
                    answer_text:        answer.answerText        ?? null,
                    paste_count:        pasteCountForQ,
                    time_spent_seconds: timeSpent,
                }),
            });
            const data = await res.json();
            setSubmitted(prev => ({ ...prev, [currentQ.id]: true }));
            if (data.ai_flagged) setAiFlagWarning(true);
            return true;
        } catch {
            return false;
        } finally {
            setSubmitting(false);
        }
    }

    async function goNext() {
        await submitCurrentQuestion();
        if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1);
    }

    async function goPrev() {
        setCurrentIndex(i => i - 1);
    }

    async function handleSubmitAll() {
        if (submitting) return;
        await submitCurrentQuestion();
        setSubmitting(true);

        const timeTaken = Math.round((Date.now() - startedAt.current) / 1000);
        const form      = document.createElement('form');
        form.method     = 'POST';
        form.action     = `/quiz/attempt/${attemptId}/complete`;

        const csrf      = Object.assign(document.createElement('input'), { type: 'hidden', name: '_token',             value: getCsrf() });
        const time      = Object.assign(document.createElement('input'), { type: 'hidden', name: 'time_taken_seconds', value: timeTaken });
        form.appendChild(csrf);
        form.appendChild(time);
        document.body.appendChild(form);
        form.submit();
    }

    function formatTime(s) {
        const m = Math.floor(s / 60);
        return `${m}:${(s % 60).toString().padStart(2, '0')}`;
    }

    function getCsrf() {
        return document.querySelector('meta[name="csrf-token"]')?.content || '';
    }

    const answeredCount   = Object.keys(answers).length;
    const timerDanger     = timeLeft <= 120;
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
        <MainLayout>
            <Head title={`${quiz.title} — Quiz`} />
            <div className="quiz-attempt-wrapper">

                {/* ── Top bar ─────────────────────────────────── */}
                <div className="quiz-topbar">
                    <div className="quiz-topbar-left">
                        <span className="quiz-title-sm">{quiz.title}</span>
                        {attemptNumber > 1 && (
                            <span style={{ fontSize: 11, color: 'var(--champagne)', background: 'var(--champagne-soft)', border: '1px solid var(--champagne-border)', padding: '2px 8px', borderRadius: 999 }}>
                                Attempt {attemptNumber}
                            </span>
                        )}
                        <span style={{ color: 'var(--text3)', fontSize: 13 }}>
                            Q {currentIndex + 1} / {questions.length}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                            {answeredCount}/{questions.length} answered
                        </span>
                        <div className={`quiz-timer${timerDanger ? ' danger' : ''}`}>
                            ⏱ {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 3, background: 'var(--surface2)' }}>
                    <div style={{ height: '100%', width: `${progressPercent}%`, background: 'var(--violet-bright)', transition: 'width 0.3s ease' }} />
                </div>

                {/* AI flag warning */}
                {aiFlagWarning && (
                    <div style={{ background: 'color-mix(in srgb, var(--coral) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--coral) 30%, transparent)', color: 'var(--coral)', fontSize: 13, padding: '10px 20px', textAlign: 'center' }}>
                        ⚠️ Paste detected — this has been logged. Pasting code from external sources will be flagged.
                    </div>
                )}

                {/* ── Question area ────────────────────────────── */}
                <div className="quiz-content">
                    <div className="quiz-question-card">

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)' }}>
                                Question {currentIndex + 1}
                            </span>
                            <span className={`quiz-type-badge ${currentQ.type}`}>
                                {currentQ.type === 'mcq' ? '📋 Multiple Choice' : '💻 Coding'}
                            </span>
                            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--champagne)', fontWeight: 600 }}>
                                {currentQ.marks} marks
                            </span>
                        </div>

                        {/* Question body */}
                        <div style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text)', marginBottom: 24, whiteSpace: 'pre-wrap' }}>
                            {currentQ.body}
                        </div>

                        {/* ── MCQ options ──────────────────────── */}
                        {currentQ.type === 'mcq' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {currentQ.options.map((opt, i) => {
                                    const selected = answers[currentQ.id]?.selectedOptionId === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => setOptionAnswer(currentQ.id, opt.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 14,
                                                padding: '14px 18px', borderRadius: 'var(--r)',
                                                border: selected ? '2px solid var(--violet-bright)' : '1px solid var(--border)',
                                                background: selected ? 'color-mix(in srgb, var(--violet) 12%, transparent)' : 'var(--surface)',
                                                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%',
                                            }}
                                        >
                                            <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: selected ? 'var(--violet-bright)' : 'var(--surface2)', color: selected ? '#fff' : 'var(--text3)' }}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <span style={{ fontSize: 14, color: selected ? 'var(--text)' : 'var(--text2)', lineHeight: 1.5 }}>
                                                {opt.option_text}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── Coding — Monaco Editor ───────────── */}
                        {currentQ.type === 'coding' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>
                                        Language: <span style={{ color: 'var(--cyan)' }}>{currentQ.language || 'javascript'}</span>
                                    </span>
                                    <span style={{ fontSize: 11, color: 'var(--coral)' }}>⚠ Do not paste from external sources</span>
                                </div>

                                {/* Monaco Editor */}
                                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden' }}
                                    onPaste={() => handlePaste(currentQ.id)}
                                >
                                    <Editor
                                        height="320px"
                                        language={currentQ.language || 'javascript'}
                                        theme="vs-dark"
                                        value={answers[currentQ.id]?.answerText ?? (currentQ.starter_code || '')}
                                        onChange={val => setCodeAnswer(currentQ.id, val)}
                                        options={{
                                            fontSize:            14,
                                            fontFamily:          "'JetBrains Mono', 'Fira Code', monospace",
                                            minimap:             { enabled: false },
                                            scrollBeyondLastLine: false,
                                            wordWrap:            'on',
                                            lineNumbers:         'on',
                                            tabSize:             2,
                                            automaticLayout:     true,
                                            padding:             { top: 12, bottom: 12 },
                                        }}
                                    />
                                </div>

                                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                                    {(answers[currentQ.id]?.answerText || '').length} characters
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Navigation ───────────────────────────── */}
                    <div className="quiz-nav">
                        <button className="btn btn-ghost" onClick={goPrev} disabled={currentIndex === 0 || submitting}>
                            ← Previous
                        </button>

                        {/* Question dots */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {questions.map((q, i) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentIndex(i)}
                                    style={{
                                        width: 32, height: 32, borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                        border: i === currentIndex ? '2px solid var(--violet-bright)' : '1px solid var(--border)',
                                        background: answers[q.id]
                                            ? 'color-mix(in srgb, var(--emerald) 20%, transparent)'
                                            : i === currentIndex
                                                ? 'color-mix(in srgb, var(--violet) 15%, transparent)'
                                                : 'var(--surface)',
                                        color: answers[q.id]
                                            ? 'var(--emerald)'
                                            : i === currentIndex ? 'var(--violet-bright)' : 'var(--text3)',
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        {currentIndex < questions.length - 1 ? (
                            <button className="btn btn-primary" onClick={goNext} disabled={submitting}>
                                {submitting ? 'Saving…' : 'Next →'}
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                style={{ background: 'var(--emerald)', borderColor: 'var(--emerald)' }}
                                onClick={handleSubmitAll}
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting…' : '✓ Submit Quiz'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
