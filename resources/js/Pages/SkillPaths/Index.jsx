import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

const DIFF_COLOR = { easy: 'var(--emerald, #10b981)', medium: 'var(--amber, #f59e0b)', hard: 'var(--rose, #ef4444)' };

export default function SkillPaths() {
    const { paths } = usePage().props;

    return (
        <MainLayout title="Skill Paths">
            <Head title="Skill Paths" />
            <div className="container" data-reveal-stagger="80" style={{ paddingTop: 36, paddingBottom: 80, maxWidth: 900 }}>
                <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>📈 Level up your rank</h1>
                <p style={{ color: 'var(--text3)', marginBottom: 28 }}>
                    Targeted next steps to climb the leaderboard — based on where you stand in each skill.
                </p>

                {paths.length === 0 ? (
                    <div className="dash-card dash-empty" data-reveal>
                        Start by answering questions in the <Link href="/forum" className="link-underline">forum</Link> or taking a <Link href="/quiz" className="link-underline">quiz</Link> — your personalised paths will appear here.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 16 }}>
                        {paths.map((p) => (
                            <div key={p.tag_id} className="dash-card hover-lift" data-reveal>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                                    <h4 style={{ margin: 0 }}>{p.tag_name}</h4>
                                    <span style={{
                                        fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                                        background: p.focus === 'climb' ? 'rgba(34,211,238,.12)' : 'rgba(124,92,255,.12)',
                                        border: `1px solid ${p.focus === 'climb' ? 'rgba(34,211,238,.3)' : 'rgba(124,92,255,.3)'}`,
                                        color: p.focus === 'climb' ? 'var(--cyan)' : 'var(--text2)',
                                    }}>
                                        {p.focus === 'climb' ? `${p.standing} — climb higher` : 'New skill to build'}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gap: 8 }}>
                                    {p.quizzes.map((q) => (
                                        <Link key={q.slug} href={`/quiz/${q.slug}`} className="app-row hover-raise" style={{ alignItems: 'center', textDecoration: 'none' }}>
                                            <span style={{ fontSize: 18 }}>🎯</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, color: 'var(--text)' }}>Take the “{q.title}” quiz</div>
                                                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Earn rank points · <span style={{ color: DIFF_COLOR[q.difficulty] }}>{q.difficulty}</span></div>
                                            </div>
                                            <span className="btn-sm btn-outline-sm">Start →</span>
                                        </Link>
                                    ))}

                                    {p.open_topics > 0 && (
                                        <Link href={`/forum?tag=${p.tag_slug}`} className="app-row hover-raise" style={{ alignItems: 'center', textDecoration: 'none' }}>
                                            <span style={{ fontSize: 18 }}>💬</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, color: 'var(--text)' }}>Answer {p.open_topics} open {p.open_topics === 1 ? 'question' : 'questions'} in {p.tag_name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Accepted answers earn +50, likes +10 each</div>
                                            </div>
                                            <span className="btn-sm btn-outline-sm">Browse →</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
