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
    const { quiz, existingAttempt, auth } = usePage().props;
    const [starting, setStarting] = useState(false);

    const user        = auth?.user;
    const isCandidate = user?.roles?.some(r => r.name === 'candidate');
    const dc          = DIFFICULTY_COLORS[quiz.difficulty] || DIFFICULTY_COLORS.medium;

    function startQuiz() {
        if (!confirm(`You are about to start "${quiz.title}". You have ${quiz.time_limit_minutes} minutes. This quiz can only be attempted once. Ready?`)) return;
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

                {/* Hero card */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 36, marginBottom: 20 }}>

                    {/* Tag + difficulty row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                        {quiz.tag && (
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', background: 'var(--cyan-soft)', border: '1px solid var(--cyan-border)', padding: '3px 10px', borderRadius: 999 }}>
                                #{quiz.tag.name}
                            </span>
                        )}
                        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize', color: dc.color, background: dc.bg, border: `1px solid ${dc.border}`, padding: '3px 10px', borderRadius: 999 }}>
                            {quiz.difficulty}
                        </span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: 12 }}>{quiz.title}</h1>

                    {quiz.description && (
                        <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 24 }}>
                            {quiz.description}
                        </p>
                    )}

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 28 }}>
                        {[
                            { icon: '📝', label: 'Questions', value: quiz.questions.length },
                            { icon: '⏱', label: 'Time Limit', value: `${quiz.time_limit_minutes} min` },
                            { icon: '🏆', label: 'Total Marks', value: quiz.total_marks },
                            { icon: '✅', label: 'Pass Score', value: `${quiz.passing_score}%` },
                        ].map(s => (
                            <div key={s.label} style={{ background: 'var(--bg)', padding: '16px 12px', textAlign: 'center' }}>
                                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* CTA based on state */}
                    <AttemptCTA
                        user={user}
                        isCandidate={isCandidate}
                        existingAttempt={existingAttempt}
                        starting={starting}
                        onStart={startQuiz}
                    />
                </div>

                {/* Rules card */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                    <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>📋 Rules & Integrity</div>
                    <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>
                        <li>This quiz can only be attempted <strong style={{ color: 'var(--text2)' }}>once</strong>. There are no retakes.</li>
                        <li>You have <strong style={{ color: 'var(--text2)' }}>{quiz.time_limit_minutes} minutes</strong> from the moment you start. The quiz auto-submits when time runs out.</li>
                        <li><strong style={{ color: 'var(--coral)' }}>Do not paste code</strong> from external sources — paste events are logged and flagged.</li>
                        <li>Coding answers are AI-scored for quality and AI-generation likelihood. Flagged answers have points withheld.</li>
                        <li>Passing score is <strong style={{ color: 'var(--text2)' }}>{quiz.passing_score}%</strong>. Points are awarded on completion regardless of pass/fail.</li>
                        <li>All rank points awarded are reflected on the leaderboard within a few seconds.</li>
                    </ul>
                </div>

                <FullFooter />
            </div>
        </MainLayout>
    );
}

function AttemptCTA({ user, isCandidate, existingAttempt, starting, onStart }) {
    // Not logged in
    if (!user) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href="/account" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
                    Login to Attempt
                </Link>
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>Free account required</span>
            </div>
        );
    }

    // Company or admin — info only
    if (!isCandidate) {
        return (
            <div style={{ padding: '12px 16px', background: 'var(--surface2)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--text3)' }}>
                🔒 Only candidate accounts can attempt quizzes.
            </div>
        );
    }

    // Already completed
    if (existingAttempt?.status === 'completed') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href={`/quiz/result/${existingAttempt.id}`} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
                    View Your Result →
                </Link>
                <span style={{ fontSize: 13, color: 'var(--emerald)' }}>✅ You have completed this quiz</span>
            </div>
        );
    }

    // In progress
    if (existingAttempt?.status === 'in_progress') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <LoadingButton className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15, background: 'var(--champagne)', borderColor: 'var(--champagne)', color: '#000' }}
                    loading={starting} onClick={onStart}>
                    ▶ Resume Quiz
                </LoadingButton>
                <span style={{ fontSize: 13, color: 'var(--champagne)' }}>⚠ You have an unfinished attempt</span>
            </div>
        );
    }

    // Not attempted — ready to start
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LoadingButton className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}
                loading={starting} onClick={onStart}>
                Start Quiz →
            </LoadingButton>
            <span style={{ fontSize: 13, color: 'var(--text3)' }}>One attempt only</span>
        </div>
    );
}
