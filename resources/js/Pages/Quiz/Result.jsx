import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

export default function QuizResult() {
    const { attempt } = usePage().props;
    const quiz        = attempt.quiz;
    const answers     = attempt.answers;
    const passed      = attempt.passed;
    const pct         = attempt.percentage;

    const correctCount  = answers.filter(a => a.is_correct).length;
    const flaggedCount  = answers.filter(a => a.ai_flagged).length;
    const timeTaken     = formatTime(attempt.time_taken_seconds);

    return (
        <MainLayout>
            <Head title={`Quiz Result — ${quiz.title}`} />
            <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 760 }}>

                {/* ── Result Hero ────────────────────────────────── */}
                <div className="quiz-result-hero" style={{ borderColor: passed ? 'color-mix(in srgb, var(--emerald) 40%, transparent)' : 'color-mix(in srgb, var(--coral) 40%, transparent)' }}>
                    <div className="quiz-result-icon">{passed ? '🏆' : '📚'}</div>
                    <h1 style={{ marginBottom: 6 }}>{passed ? 'Quiz Passed!' : 'Keep Practising'}</h1>
                    <p style={{ color: 'var(--text3)', marginBottom: 24 }}>{quiz.title}</p>

                    {/* Score ring */}
                    <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 24px' }}>
                        <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface2)" strokeWidth="10" />
                            <circle cx="60" cy="60" r="52" fill="none"
                                stroke={passed ? 'var(--emerald)' : 'var(--coral)'}
                                strokeWidth="10"
                                strokeDasharray={`${2 * Math.PI * 52}`}
                                strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 1s ease' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: passed ? 'var(--emerald)' : 'var(--coral)' }}>
                                {Math.round(pct)}%
                            </span>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, background: 'var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 20 }}>
                        {[
                            { label: 'Score', value: `${attempt.score}/${quiz.total_marks}`, color: 'var(--cyan)' },
                            { label: 'Correct', value: `${correctCount}/${answers.length}`, color: 'var(--emerald)' },
                            { label: 'Time', value: timeTaken, color: 'var(--text)' },
                            { label: 'Rank +pts', value: attempt.rank_points_awarded, color: 'var(--champagne)' },
                        ].map(s => (
                            <div key={s.label} style={{ background: 'var(--surface)', padding: '14px 10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* AI flag warning */}
                    {attempt.ai_flagged && (
                        <div style={{ background: 'color-mix(in srgb, var(--coral) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--coral) 30%, transparent)', borderRadius: 'var(--r)', padding: '12px 16px', fontSize: 13, color: 'var(--coral)', textAlign: 'left', marginBottom: 16 }}>
                            ⚠️ <strong>{flaggedCount} answer{flaggedCount > 1 ? 's' : ''}</strong> flagged for possible AI assistance. Points for those answers are withheld pending admin review. Your other answers have been scored normally.
                        </div>
                    )}

                    {/* Pass/fail message */}
                    <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                        {passed
                            ? `You passed with ${Math.round(pct)}%. Passing score was ${quiz.passing_score}%. +${attempt.rank_points_awarded} rank points awarded.`
                            : `Passing score is ${quiz.passing_score}%. You scored ${Math.round(pct)}%. Review the answers below and try related forum topics to improve.`
                        }
                    </div>
                </div>

                {/* ── Answer Breakdown ───────────────────────────── */}
                <h3 style={{ margin: '32px 0 16px' }}>Answer Breakdown</h3>

                {answers.map((answer, i) => (
                    <AnswerRow key={answer.id} answer={answer} index={i} />
                ))}

                {/* ── Actions ──────────────────────────────────────── */}
                <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
                    <Link href="/quiz" className="btn btn-primary">Browse More Quizzes</Link>
                    <Link href="/leaderboard" className="btn btn-ghost">View Leaderboard</Link>
                    {quiz.tag && (
                        <Link href={`/forum?tag=${quiz.tag.slug}`} className="btn btn-ghost">
                            Forum: #{quiz.tag.name}
                        </Link>
                    )}
                </div>

                <FullFooter />
            </div>
        </MainLayout>
    );
}

function AnswerRow({ answer, index }) {
    const q          = answer.question;
    const isMcq      = q?.type === 'mcq';
    const isCorrect  = answer.is_correct;
    const isFlagged  = answer.ai_flagged;

    let borderColor = 'var(--border)';
    if (isCorrect && !isFlagged) borderColor = 'color-mix(in srgb, var(--emerald) 40%, transparent)';
    else if (!isCorrect) borderColor = 'color-mix(in srgb, var(--coral) 40%, transparent)';
    if (isFlagged) borderColor = 'color-mix(in srgb, var(--champagne) 40%, transparent)';

    return (
        <div style={{ background: 'var(--surface)', border: `1px solid ${borderColor}`, borderLeft: `3px solid ${borderColor}`, borderRadius: 'var(--r-lg)', padding: 20, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 13, color: 'var(--text2)', flex: 1 }}>
                    <span style={{ color: 'var(--text3)', marginRight: 8, fontWeight: 700 }}>Q{index + 1}.</span>
                    {q?.body}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {isFlagged && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'color-mix(in srgb, var(--champagne) 15%, transparent)', color: 'var(--champagne)', border: '1px solid color-mix(in srgb, var(--champagne) 30%, transparent)', fontWeight: 700 }}>AI Flagged</span>}
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 700, background: isCorrect ? 'color-mix(in srgb, var(--emerald) 15%, transparent)' : 'color-mix(in srgb, var(--coral) 12%, transparent)', color: isCorrect ? 'var(--emerald)' : 'var(--coral)', border: `1px solid ${isCorrect ? 'color-mix(in srgb, var(--emerald) 30%, transparent)' : 'color-mix(in srgb, var(--coral) 25%, transparent)'}` }}>
                        {isCorrect ? `+${answer.marks_awarded}` : '0'} / {q?.marks} pts
                    </span>
                </div>
            </div>

            {/* MCQ: show selected vs correct */}
            {isMcq && answer.selected_option && (
                <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>
                    Your answer: <span style={{ color: isCorrect ? 'var(--emerald)' : 'var(--coral)', fontWeight: 600 }}>
                        {answer.selected_option.option_text}
                    </span>
                </div>
            )}

            {/* Coding: show submitted code snippet */}
            {!isMcq && answer.answer_text && (
                <div style={{ marginTop: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)', maxHeight: 120, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                    {answer.answer_text.slice(0, 400)}{answer.answer_text.length > 400 ? '\n…' : ''}
                </div>
            )}

            {isFlagged && (
                <div style={{ fontSize: 12, color: 'var(--champagne)', marginTop: 8 }}>
                    ⚠ Points withheld — pending admin review of AI detection flags.
                </div>
            )}
        </div>
    );
}

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
}
