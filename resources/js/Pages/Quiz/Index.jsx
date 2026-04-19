import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

const DIFFICULTY_COLORS = {
    easy:   { bg: 'color-mix(in srgb, var(--emerald) 12%, transparent)', color: 'var(--emerald)',   border: 'color-mix(in srgb, var(--emerald) 30%, transparent)' },
    medium: { bg: 'color-mix(in srgb, var(--champagne) 12%, transparent)', color: 'var(--champagne)', border: 'color-mix(in srgb, var(--champagne) 30%, transparent)' },
    hard:   { bg: 'color-mix(in srgb, var(--coral) 12%, transparent)',   color: 'var(--coral)',     border: 'color-mix(in srgb, var(--coral) 30%, transparent)' },
};

export default function QuizIndex() {
    const { quizzes, filters, auth } = usePage().props;
    const [difficulty, setDifficulty] = useState(filters.difficulty || '');

    const isCandidate = auth?.user?.roles?.some(r => r.name === 'candidate');

    function applyDifficulty(val) {
        setDifficulty(val);
        router.get('/quiz', { ...filters, difficulty: val || undefined }, { preserveScroll: true });
    }

    return (
        <MainLayout>
            <Head title="Skill Quizzes — DevRank" />
            <div className="container" style={{ paddingTop: 36, paddingBottom: 80 }}>

                {/* Header */}
                <div style={{ marginBottom: 36 }}>
                    <h1 style={{ marginBottom: 8 }}>Skill Quizzes</h1>
                    <p style={{ color: 'var(--text3)', fontSize: 14, maxWidth: 560 }}>
                        Prove your knowledge. Quizzes are AI-proctored, time-limited, and contribute directly to your DevRank score.
                    </p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                    {['', 'easy', 'medium', 'hard'].map(d => (
                        <button
                            key={d}
                            onClick={() => applyDifficulty(d)}
                            style={{
                                padding: '6px 16px',
                                borderRadius: 999,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: difficulty === d ? '1px solid var(--violet-bright)' : '1px solid var(--border)',
                                background: difficulty === d ? 'color-mix(in srgb, var(--violet) 15%, transparent)' : 'var(--surface)',
                                color: difficulty === d ? 'var(--violet-bright)' : 'var(--text3)',
                                transition: 'all 0.15s',
                                textTransform: 'capitalize',
                            }}
                        >
                            {d || 'All Levels'}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {quizzes.data.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text3)' }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
                        <h3 style={{ color: 'var(--text2)', marginBottom: 8 }}>No quizzes published yet.</h3>
                        <p style={{ fontSize: 14 }}>Check back soon — new quizzes are added regularly.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                        {quizzes.data.map(quiz => (
                            <QuizCard key={quiz.id} quiz={quiz} isCandidate={isCandidate} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {quizzes.last_page > 1 && (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 40 }}>
                        {quizzes.links.map((link, i) => link.url ? (
                            <Link key={i} href={link.url} className={`btn btn-sm ${link.active ? 'btn-primary' : 'btn-ghost'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }} />
                        ) : (
                            <span key={i} className="btn btn-sm btn-ghost" style={{ opacity: 0.4, cursor: 'default' }}
                                dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}

                <FullFooter />
            </div>
        </MainLayout>
    );
}

function QuizCard({ quiz, isCandidate }) {
    const dc = DIFFICULTY_COLORS[quiz.difficulty] || DIFFICULTY_COLORS.medium;

    return (
        <div className="quiz-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 32 }}>{quiz.tag?.name ? tagEmoji(quiz.tag.name) : '🎯'}</div>
                <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', background: dc.bg, color: dc.color, border: `1px solid ${dc.border}` }}>
                    {quiz.difficulty}
                </span>
            </div>

            <h3 style={{ fontSize: '1.05rem', marginBottom: 6, lineHeight: 1.3 }}>{quiz.title}</h3>

            {quiz.tag && (
                <div style={{ fontSize: 12, color: 'var(--cyan)', marginBottom: 8 }}>#{quiz.tag.name}</div>
            )}

            <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 16, minHeight: 40 }}>
                {quiz.description?.slice(0, 100) || 'Test your knowledge and earn rank points.'}
                {quiz.description?.length > 100 ? '…' : ''}
            </p>

            {/* Meta */}
            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text3)', marginBottom: 18 }}>
                <span>📝 {quiz.questions_count} questions</span>
                <span>⏱ {quiz.time_limit_minutes} min</span>
                <span>🏆 {quiz.total_marks} marks</span>
            </div>

            {isCandidate ? (
                <Link href={`/quiz/${quiz.slug}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
                    Start Quiz →
                </Link>
            ) : (
                <Link href="/account" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
                    Login to Attempt
                </Link>
            )}
        </div>
    );
}

function tagEmoji(tagName) {
    const map = { React: '⚛️', JavaScript: '🟨', TypeScript: '🔷', Laravel: '🐘', PHP: '🐘', Python: '🐍', Node: '🟢', 'Node.js': '🟢', 'System Design': '🏗️', AWS: '☁️', Docker: '🐳', SQL: '🗄️', MySQL: '🗄️' };
    return Object.entries(map).find(([k]) => tagName.includes(k))?.[1] || '🎯';
}
