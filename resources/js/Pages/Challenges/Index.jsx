import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import CountUp from '@/Components/CountUp';

const LEAGUE = {
    Gold:   { color: '#f5c542', emoji: '🥇' },
    Silver: { color: '#cbd5e1', emoji: '🥈' },
    Bronze: { color: '#cd7f32', emoji: '🥉' },
};

export default function Challenges() {
    const { season, leaderboard, challenges, standing } = usePage().props;

    if (!season) {
        return (
            <MainLayout title="Challenges">
                <Head title="Weekly Challenges" />
                <div className="container" style={{ paddingTop: 48, paddingBottom: 80, textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem' }}>No active season</h1>
                    <p style={{ color: 'var(--text3)' }}>A new season of weekly challenges is coming soon. Check back shortly.</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Challenges">
            <Head title={`${season.name} — Weekly Challenges`} />
            <div className="container" data-reveal-stagger="80" style={{ paddingTop: 36, paddingBottom: 80 }}>

                {/* Season banner */}
                <div className="dash-card" data-reveal="fade" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                    <div>
                        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)' }}>Current Season</div>
                        <h1 style={{ fontSize: '2rem', margin: '4px 0 0' }}>🏆 {season.name}</h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cyan)' }}><CountUp end={season.days_left} /> days</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)' }}>left this season</div>
                    </div>
                </div>

                {/* Your standing */}
                {standing && (
                    <div className="dash-card" data-reveal style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 20 }}>
                        <StandingStat label="Your rank" value={`#${standing.rank}`} />
                        <StandingStat label="League" value={<span style={{ color: LEAGUE[standing.league]?.color }}>{LEAGUE[standing.league]?.emoji} {standing.league}</span>} />
                        <StandingStat label="Season points" value={standing.points} />
                        <StandingStat label="Challenges done" value={standing.challenges} />
                    </div>
                )}

                {/* Active challenges */}
                <div className="dash-card" data-reveal style={{ marginBottom: 20 }}>
                    <div className="dash-card-header"><h4>⚡ Live challenges</h4></div>
                    {challenges.length > 0 ? (
                        <div style={{ display: 'grid', gap: 10 }}>
                            {challenges.map((c) => (
                                <Link key={c.slug} href={`/quiz/${c.slug}`} className="app-row hover-raise" style={{ alignItems: 'center', textDecoration: 'none' }}>
                                    <span style={{ fontSize: 20 }}>🎯</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.title}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                                            {c.tag ? `${c.tag} · ` : ''}{c.difficulty}{c.ends_at ? ` · ends ${new Date(c.ends_at).toLocaleDateString()}` : ''}
                                        </div>
                                    </div>
                                    <span className="btn-sm btn-primary-sm">Take challenge →</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="dash-empty">No live challenges right now — the next one drops soon.</div>
                    )}
                </div>

                {/* Season leaderboard */}
                <div className="dash-card" data-reveal>
                    <div className="dash-card-header"><h4>Season leaderboard</h4></div>
                    {leaderboard.length > 0 ? (
                        <div>
                            {leaderboard.map((r) => (
                                <div key={r.user_id} className="app-row" style={{ alignItems: 'center' }}>
                                    <div style={{ minWidth: 40, fontWeight: 800, color: 'var(--text3)' }}>#{r.rank}</div>
                                    <div style={{ minWidth: 74, fontSize: 13, fontWeight: 600, color: LEAGUE[r.league]?.color }}>
                                        {LEAGUE[r.league]?.emoji} {r.league}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Link href={`/candidate/${r.user_id}`} className="link-underline" style={{ fontWeight: 600 }}>{r.name}</Link>
                                        <div style={{ fontSize: 12, color: 'var(--text3)' }}>{r.challenges} challenge{r.challenges === 1 ? '' : 's'} completed</div>
                                    </div>
                                    <div style={{ fontWeight: 800, color: 'var(--cyan)' }}>{r.points} pts</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="dash-empty">Be the first on the board — take a live challenge above.</div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

function StandingStat({ label, value }) {
    return (
        <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{label}</div>
        </div>
    );
}
