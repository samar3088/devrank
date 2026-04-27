import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import LoadingButton from '@/Components/LoadingButton';
import { FullFooter } from '@/Components/Footer';

const DIFFICULTY_COLORS = {
    easy:   { color: 'var(--emerald)',   bg: 'color-mix(in srgb, var(--emerald) 12%, transparent)',   border: 'color-mix(in srgb, var(--emerald) 30%, transparent)' },
    medium: { color: 'var(--champagne)', bg: 'color-mix(in srgb, var(--champagne) 12%, transparent)', border: 'color-mix(in srgb, var(--champagne) 30%, transparent)' },
    hard:   { color: 'var(--coral)',     bg: 'color-mix(in srgb, var(--coral) 12%, transparent)',     border: 'color-mix(in srgb, var(--coral) 30%, transparent)' },
};

export default function QuizShow() {
    const { quiz, summary, auth, flash } = usePage().props;
    const [starting, setStarting] = useState(false);

    const user        = auth?.user;
    const isCandidate = user?.roles?.some(r => r.name === 'candidate');
    const dc          = DIFFICULTY_COLORS[quiz.difficulty] || DIFFICULTY_COLORS.medium;

    const maxLabel = quiz.max_attempts === 0
        ? 'Unlimited attempts'
        : quiz.max_attempts === 1
            ? '1 attempt only'
            : `${quiz.max_attempts} attempts allowed`;

    function startQuiz() {
        const attemptNum = (summary?.completed_count ?? 0) + 1;
        const isRetake   = attemptNum > 1;
        const msg = isRetake
            ? `Start attempt ${attemptNum} of ${quiz.max_attempts === 0 ? '∞' : quiz.max_attempts}? Your best score will be kept for ranking.`
            : `You have ${quiz.time_limit_minutes} minutes. ${quiz.max_attempts === 1 ? 'This quiz can only be attempted once.' : `You have ${quiz.max_attempts === 0 ? 'unlimited' : quiz.max_attempts} attempts.`} Ready?`;

        if (!confirm(msg)) return;
        setStarting(true);
        router.post(`/quiz/${quiz.id}/start`, {}, {
            onFinish: () => setStarting(false),
        });
    }

    return (
        <MainLayout>
            <Head title={`${quiz.title} — DevRank Quiz`} />
            <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 760 }}>

                {/* Breadcrumb */}
                <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>
                    <Link href="/quiz" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Quizzes</Link>
                    {' '} › <span style={{ color: 'var(--text2)' }}>{quiz.title}</span>
                </div>

                {/* Flash error */}
                {flash?.error && (
                    <div style={{ background: 'var(--coral-soft)', border: '1px solid var(--coral-border)', borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--coral)' }}>
                        {flash.error}
                    </div>
                )}

                {/* Hero card */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 36, marginBottom: 20 }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                        {quiz.tag && (
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', background: 'var(--cyan-soft)', border: '1px solid var(--cyan-border)', padding: '3px 10px', borderRadius: 999 }}>
                                #{quiz.tag.name}
                            </span>
                        )}
                        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize', color: dc.color, background: dc.bg, border: `1px solid ${dc.border}`, padding: '3px 10px', borderRadius: 999 }}>
                            {quiz.difficulty}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 'auto' }}>{maxLabel}</span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: 12 }}>{quiz.title}</h1>

                    {quiz.description && (
                        <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 24 }}>
                            {quiz.description}
                        </p>
                    )}

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 28 }}>
                        {[
                            { icon: '📝', label: 'Questions',  value: quiz.questions.length },
                            { icon: '⏱',  label: 'Time Limit', value: `${quiz.time_limit_minutes} min` },
                            { icon: '🏆', label: 'Total Marks', value: quiz.total_marks },
                            { icon: '✅', label: 'Pass Score',  value: `${quiz.passing_score}%` },
                        ].map(s => (
                            <div key={s.label} style={{ background: 'var(--bg)', padding: '16px 12px', textAlign: 'center' }}>
                                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <AttemptCTA
                        user={user}
                        isCandidate={isCandidate}
                        summary={summary}
                        starting={starting}
                        onStart={startQuiz}
                    />
                </div>

                {/* Attempt history — show if candidate has prior attempts */}
                {summary && summary.completed_count > 0 && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 20 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
                            Your Attempts
                            {summary.best_attempt && (
                                <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 400, color: 'var(--text3)' }}>
                                    Best: <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>{Math.round(summary.best_percentage)}%</span>
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {summary.attempts.filter(a => a.status === 'completed').map(a => (
                                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 'var(--r)', border: `1px solid ${a.id === summary.best_attempt?.id ? 'color-mix(in srgb, var(--emerald) 30%, transparent)' : 'var(--border)'}` }}>
                                    <span style={{ fontSize: 12, color: 'var(--text3)', width: 70 }}>Attempt {a.attempt_number}</span>
                                    <span style={{ fontWeight: 700, color: a.passed ? 'var(--emerald)' : 'var(--coral)', minWidth: 50 }}>
                                        {Math.round(a.percentage)}%
                                    </span>
                                    <span className={`admin-badge admin-badge-${a.passed ? 'green' : 'red'}`} style={{ fontSize: 11 }}>
                                        {a.passed ? 'Passed' : 'Failed'}
                                    </span>
                                    {a.ai_flagged && (
                                        <span style={{ fontSize: 11, color: 'var(--coral)' }}>⚠ AI Flagged</span>
                                    )}
                                    {a.rank_points_awarded > 0 && (
                                        <span style={{ fontSize: 12, color: 'var(--champagne)', fontWeight: 600, marginLeft: 'auto' }}>
                                            +{a.rank_points_awarded} pts
                                        </span>
                                    )}
                                    {a.id === summary.best_attempt?.id && (
                                        <span style={{ fontSize: 11, color: 'var(--emerald)', marginLeft: a.rank_points_awarded > 0 ? 0 : 'auto' }}>⭐ Best</span>
                                    )}
                                    <Link href={`/quiz/result/${a.id}`} style={{ fontSize: 12, color: 'var(--violet-bright)', marginLeft: 'auto', textDecoration: 'none' }}>
                                        View →
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Remaining attempts info */}
                        {summary.remaining !== null && (
                            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)', textAlign: 'right' }}>
                                {summary.remaining > 0
                                    ? `${summary.remaining} attempt${summary.remaining > 1 ? 's' : ''} remaining`
                                    : 'No attempts remaining'}
                            </div>
                        )}
                    </div>
                )}

                {/* Rules */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                    <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>📋 Rules & Integrity</div>
                    <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>
                        <li>
                            {quiz.max_attempts === 0
                                ? 'This quiz has unlimited attempts.'
                                : quiz.max_attempts === 1
                                    ? 'This quiz can only be attempted <strong>once</strong>. There are no retakes.'
                                    : `This quiz allows up to <strong>${quiz.max_attempts} attempts</strong>.`
                            }
                            {quiz.max_attempts > 1 && ' Only your improvement over your previous best score earns additional rank points.'}
                        </li>
                        <li>You have <strong style={{ color: 'var(--text2)' }}>{quiz.time_limit_minutes} minutes</strong> per attempt. The quiz auto-submits when time runs out.</li>
                        <li><strong style={{ color: 'var(--coral)' }}>Do not paste code</strong> from external sources — paste events are logged and flagged.</li>
                        <li>Passing score is <strong style={{ color: 'var(--text2)' }}>{quiz.passing_score}%</strong>. Rank points are awarded on completion.</li>
                        {quiz.max_attempts > 1 && (
                            <li>Rankings are based on your <strong style={{ color: 'var(--text2)' }}>best attempt</strong>. Only score improvements add to your rank.</li>
                        )}
                    </ul>
                </div>

                <FullFooter />
            </div>
        </MainLayout>
    );
}

function AttemptCTA({ user, isCandidate, summary, starting, onStart }) {
    if (!user) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href="/account" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>Login to Attempt</Link>
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>Free account required</span>
            </div>
        );
    }

    if (!isCandidate) {
        return (
            <div style={{ padding: '12px 16px', background: 'var(--surface2)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--text3)' }}>
                🔒 Only candidate accounts can attempt quizzes.
            </div>
        );
    }

    // Resume in-progress
    if (summary?.in_progress) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <LoadingButton className="btn btn-primary" loading={starting} onClick={onStart}
                    style={{ padding: '12px 28px', fontSize: 15, background: 'var(--champagne)', borderColor: 'var(--champagne)', color: '#000' }}>
                    ▶ Resume Attempt {summary.in_progress.attempt_number}
                </LoadingButton>
                <span style={{ fontSize: 13, color: 'var(--champagne)' }}>⚠ You have an unfinished attempt</span>
            </div>
        );
    }

    // No more attempts
    if (summary && !summary.can_attempt) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ padding: '10px 20px', background: 'var(--surface2)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--text3)', border: '1px solid var(--border)' }}>
                    ✗ All attempts used
                </span>
                {summary.best_attempt && (
                    <Link href={`/quiz/result/${summary.best_attempt.id}`} className="btn btn-ghost" style={{ fontSize: 13 }}>
                        View Best Result →
                    </Link>
                )}
            </div>
        );
    }

    // Ready to attempt (first or retake)
    const attemptNum    = (summary?.completed_count ?? 0) + 1;
    const isRetake      = attemptNum > 1;
    const maxAttempts   = summary?.max_attempts ?? 1;
    const remainingText = maxAttempts === 0
        ? ''
        : isRetake
            ? ` · ${summary.remaining} remaining`
            : maxAttempts === 1 ? ' · One attempt only' : ` · ${maxAttempts} attempts allowed`;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LoadingButton className="btn btn-primary" loading={starting} onClick={onStart}
                style={{ padding: '12px 28px', fontSize: 15 }}>
                {isRetake ? `Retake Quiz (Attempt ${attemptNum})` : 'Start Quiz →'}
            </LoadingButton>
            <span style={{ fontSize: 13, color: 'var(--text3)' }}>
                {isRetake ? 'Only improvement earns extra rank points' : `Ready to start${remainingText}`}
            </span>
        </div>
    );
}
