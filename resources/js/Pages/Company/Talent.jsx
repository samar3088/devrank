import { Head, Link, router, usePage } from '@inertiajs/react';
import CompanyLayout from '@/Layouts/CompanyLayout';

export default function Talent() {
    const { jobs, selectedJobId, matches } = usePage().props;

    function selectJob(e) {
        router.get('/company/talent', { job: e.target.value }, { preserveState: true, preserveScroll: true });
    }

    const scoreColor = (s) => (s >= 70 ? 'var(--emerald, #10b981)' : s >= 45 ? 'var(--cyan)' : 'var(--text3)');

    const header = (
        <div className="dash-header">
            <div className="dash-header-left">
                <h1 style={{ fontSize: '2rem' }}>Browse Talent</h1>
                <p>Candidates open to work, ranked by match to your role.</p>
            </div>
        </div>
    );

    return (
        <CompanyLayout fullWidthHeader={header}>
            <Head title="Browse Talent" />

            <div className="dash-card" data-reveal>
                {jobs.length === 0 ? (
                    <div className="dash-empty">
                        Post an active job first — then we’ll match open-to-work candidates to it.{' '}
                        <Link href="/company/jobs/create" className="link-underline">Post a job →</Link>
                    </div>
                ) : (
                    <>
                        <div className="dash-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                            <h4>Matches</h4>
                            <label style={{ fontSize: 13, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                Match to
                                <select className="form-input" value={selectedJobId ?? ''} onChange={selectJob} style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}>
                                    {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
                                </select>
                            </label>
                        </div>

                        {matches.length > 0 ? (
                            <div data-reveal-stagger="55">
                                {matches.map((m) => (
                                    <div key={m.candidate.id} className="app-row" data-reveal="fade" style={{ alignItems: 'center' }}>
                                        <div style={{ minWidth: 56, textAlign: 'center', fontWeight: 800, fontSize: 18, color: scoreColor(m.score) }}>
                                            {m.score}%
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600 }}>
                                                <Link href={`/candidate/${m.candidate.id}`} className="link-underline">{m.candidate.name}</Link>
                                            </div>
                                            <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                                                {m.candidate.headline || 'Developer'}{m.candidate.experience ? ` · ${m.candidate.experience}` : ''} · {m.candidate.location || 'Location N/A'}
                                            </div>
                                        </div>
                                        <span className="app-score" style={{ marginRight: 10 }}>{m.candidate.rank_score.toLocaleString()} pts</span>
                                        <Link href={`/candidate/${m.candidate.id}`} className="btn-sm btn-primary-sm pop-on-active">View profile</Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="dash-empty">No open-to-work candidates match this role yet.</div>
                        )}
                    </>
                )}
            </div>
        </CompanyLayout>
    );
}
