import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import MainLayout from '@/Layouts/MainLayout';

export default function QuizAttempt() {
    const { quiz, attemptId } = usePage().props;
    const questions            = quiz.questions;
    const totalSeconds         = quiz.time_limit_minutes * 60;

    const [currentIndex, setCurrentIndex]   = useState(0);
    const [answers, setAnswers]             = useState({});         // { questionId: { selectedOptionId, answerText } }
    const [timeLeft, setTimeLeft]           = useState(totalSeconds);
    const [submitting, setSubmitting]       = useState(false);
    const [submitted, setSubmitted]         = useState({});         // { questionId: true }
    const [aiFlagWarning, setAiFlagWarning] = useState(false);

    // Per-question tracking
    const pasteCount        = useRef({});    // { questionId: count }
    const questionStartTime = useRef({});    // { questionId: timestamp }
    const startedAt         = useRef(Date.now());

    const currentQ = questions[currentIndex];

    // ── Timer ───────────────────────────────────────────────────
    useEffect(() => {
        if (timeLeft <= 0) { handleSubmitAll(); return; }
        const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft]);

    // Track time per question
    useEffect(() => {
        questionStartTime.current[currentQ.id] = Date.now();
    }, [currentIndex]);

    // ── Answer handlers ──────────────────────────────────────────
    function setOptionAnswer(questionId, optionId) {
        setAnswers(prev => ({ ...prev, [questionId]: { selectedOptionId: optionId, answerText: null } }));
    }

    function setCodeAnswer(questionId, code) {
        setAnswers(prev => ({ ...prev, [questionId]: { selectedOptionId: null, answerText: code } }));
    }

    function handlePaste(questionId) {
        pasteCount.current[questionId] = (pasteCount.current[questionId] || 0) + 1;
        setAiFlagWarning(true);
        setTimeout(() => setAiFlagWarning(false), 4000);
    }

    // ── Submit single question ───────────────────────────────────
    async function submitCurrentQuestion() {
        if (submitted[currentQ.id]) return true; // already submitted

        const answer          = answers[currentQ.id] || {};
        const timeSpent       = Math.round((Date.now() - (questionStartTime.current[currentQ.id] || Date.now())) / 1000);
        const pasteCountForQ  = pasteCount.current[currentQ.id] || 0;

        setSubmitting(true);
        try {
            const res = await fetch(`/quiz/attempt/${attemptId}/answer`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrf() },
                body: JSON.stringify({
                    question_id:        currentQ.id,
                    selected_option_id: answer.selectedOptionId ?? null,
                    answer_text:        answer.answerText ?? null,
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
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
        }
    }

    async function goPrev() {
        setCurrentIndex(i => i - 1);
    }

    // ── Submit all + complete ────────────────────────────────────
    async function handleSubmitAll() {
        if (submitting) return;

        // Submit current question first if not yet submitted
        await submitCurrentQuestion();

        setSubmitting(true);
        const timeTaken = Math.round((Date.now() - startedAt.current) / 1000);

        // Use form POST to complete (Inertia redirect to result page)
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/quiz/attempt/${attemptId}/complete`;

        const csrfInput    = document.createElement('input');
        csrfInput.type     = 'hidden';
        csrfInput.name     = '_token';
        csrfInput.value    = getCsrf();

        const timeInput    = document.createElement('input');
        timeInput.type     = 'hidden';
        timeInput.name     = 'time_taken_seconds';
        timeInput.value    = timeTaken;

        form.appendChild(csrfInput);
        form.appendChild(timeInput);
        document.body.appendChild(form);
        form.submit();
    }

    function formatTime(s) {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    }

    function getCsrf() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    const answeredCount   = Object.keys(answers).length;
    const timerDanger     = timeLeft <= 120;
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
        <MainLayout>
            <Head title={`${quiz.title} — Quiz`} />
            <div className="quiz-attempt-wrapper">

                {/* ── Top Bar ─────────────────────────────────────── */}
                <div className="quiz-topbar">
                    <div className="quiz-topbar-left">
                        <span className="quiz-title-sm">{quiz.title}</span>
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

                {/* ── Question Area ────────────────────────────────── */}
                <div className="quiz-content">
                    <div className="quiz-question-card">

                        {/* Question header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)' }}>
                                Question {currentIndex + 1}
                            </span>
                            <span className={`quiz-type-badge ${currentQ.type}`}>{currentQ.type === 'mcq' ? '📋 Multiple Choice' : '💻 Coding'}</span>
                            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--champagne)', fontWeight: 600 }}>{currentQ.marks} marks</span>
                        </div>

                        {/* Question body */}
                        <div style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text)', marginBottom: 24, whiteSpace: 'pre-wrap' }}>
                            {currentQ.body}
                        </div>

                        {/* MCQ Options */}
                        {currentQ.type === 'mcq' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {currentQ.options.map((opt, i) => {
                                    const selected = answers[currentQ.id]?.selectedOptionId === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => setOptionAnswer(currentQ.id, opt.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 14,
                                                padding: '14px 18px',
                                                borderRadius: 'var(--r)',
                                                border: selected ? '2px solid var(--violet-bright)' : '1px solid var(--border)',
                                                background: selected ? 'color-mix(in srgb, var(--violet) 12%, transparent)' : 'var(--surface)',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.15s',
                                                width: '100%',
                                            }}
                                        >
                                            <span style={{ width: 28, height: 28, borderRadius: '50%', background: selected ? 'var(--violet-bright)' : 'var(--surface2)', color: selected ? '#fff' : 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
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

                        {/* Coding — Monaco-like textarea (real Monaco via npm in Phase 2) */}
                        {currentQ.type === 'coding' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>
                                        Language: <span style={{ color: 'var(--cyan)' }}>{currentQ.language || 'javascript'}</span>
                                    </span>
                                    <span style={{ fontSize: 11, color: 'var(--coral)' }}>⚠ Do not paste from external sources</span>
                                </div>
                                <textarea
                                    className="quiz-code-editor"
                                    placeholder={currentQ.starter_code || `// Write your ${currentQ.language || 'JavaScript'} solution here...`}
                                    value={answers[currentQ.id]?.answerText || ''}
                                    onChange={e => setCodeAnswer(currentQ.id, e.target.value)}
                                    onPaste={() => handlePaste(currentQ.id)}
                                    rows={16}
                                    spellCheck={false}
                                    autoComplete="off"
                                    autoCorrect="off"
                                />
                                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                                    {(answers[currentQ.id]?.answerText || '').length} characters
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Navigation ───────────────────────────────── */}
                    <div className="quiz-nav">
                        <button
                            className="btn btn-ghost"
                            onClick={goPrev}
                            disabled={currentIndex === 0 || submitting}
                        >
                            ← Previous
                        </button>

                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {questions.map((q, i) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentIndex(i)}
                                    style={{
                                        width: 32, height: 32, borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                        border: i === currentIndex ? '2px solid var(--violet-bright)' : '1px solid var(--border)',
                                        background: answers[q.id] ? 'color-mix(in srgb, var(--emerald) 20%, transparent)' : i === currentIndex ? 'color-mix(in srgb, var(--violet) 15%, transparent)' : 'var(--surface)',
                                        color: answers[q.id] ? 'var(--emerald)' : i === currentIndex ? 'var(--violet-bright)' : 'var(--text3)',
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
