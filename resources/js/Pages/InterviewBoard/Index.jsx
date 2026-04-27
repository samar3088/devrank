import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

const OUTCOME_CONFIG = {
    selected: { label: 'Selected',  color: 'var(--emerald)',   icon: '✅' },
    rejected: { label: 'Rejected',  color: 'var(--coral)',     icon: '❌' },
    ghosted:  { label: 'Ghosted',   color: 'var(--champagne)', icon: '👻' },
    pending:  { label: 'Pending',   color: 'var(--text3)',     icon: '⏳' },
};

export default function InterviewBoardIndex() {
    const { reviews, topCompanies, filters, auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const isCandidate = auth?.user?.roles?.some(r => r.name === 'candidate');

    function applyFilter(key, val) {
        router.get('/interviews', { ...filters, [key]: val || undefined }, { preserveScroll: true });
    }

    function submitSearch(e) {
        e.preventDefault();
        applyFilter('search', search);
    }

    return (
        <MainLayout>
            <Head title="Interview Board — DevRank" />
            <div className="container" style={{ paddingTop: 36, paddingBottom: 80 }}>
                <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ marginBottom: 8 }}>Interview Board</h1>
                        <p style={{ color: 'var(--text3)', fontSize: 14, maxWidth: 520 }}>Real experiences from developers. Help others prepare and know what to expect.</p>
                    </div>
                    {isCandidate && <Link href="/interviews/create" className="btn btn-primary">+ Share Your Experience</Link>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
                    <div>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                            <form onSubmit={submitSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
                                <input type="text" className="form-input" placeholder="Search company or role..."
                                    value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
                                <button type="submit" className="btn btn-primary btn-sm">Search</button>
                            </form>
                            <select className="admin-filter-select" value={filters.outcome || ''}
                                onChange={e => applyFilter('outcome', e.target.value)}>
                                <option value="">All Outcomes</option>
                                {Object.entries(OUTCOME_CONFIG).map(([val, cfg]) => (
                                    <option key={val} value={val}>{cfg.icon} {cfg.label}</option>
                                ))}
                            </select>
                        </div>

                        {reviews.data.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text3)' }}>
                                <div style={{ fontSize: 40, marginBottom: 16 }}>🎤</div>
                                <h3 style={{ color: 'var(--text2)', marginBottom: 8 }}>No reviews yet.</h3>
                                <p style={{ fontSize: 14 }}>Be the first to share your interview experience.</p>
                            </div>
                        ) : reviews.data.map(review => (
                            <ReviewCard key={review.id} review={review} authUserId={auth?.user?.id} />
                        ))}

                        {reviews.last_page > 1 && (
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 32 }}>
                                {reviews.links.map((link, i) => link.url ? (
                                    <Link key={i} href={link.url} className={`btn btn-sm ${link.active ? 'btn-primary' : 'btn-ghost'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                ) : (
                                    <span key={i} className="btn btn-sm btn-ghost" style={{ opacity: 0.4, cursor: 'default' }}
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)' }}>
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, marginBottom: 16 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🏢 Most Reviewed</div>
                            {topCompanies.length === 0 ? (
                                <div style={{ fontSize: 13, color: 'var(--text3)' }}>No reviews yet.</div>
                            ) : topCompanies.map((c, i) => (
                                <button key={c.company_name} onClick={() => applyFilter('company', filters.company === c.company_name ? '' : c.company_name)}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 13, color: 'var(--text3)', width: 20 }}>#{i + 1}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: filters.company === c.company_name ? 'var(--violet-bright)' : 'var(--text)' }}>{c.company_name}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text3)' }}>
                                        <span>{c.review_count}</span>
                                        <span style={{ color: 'var(--champagne)' }}>★ {c.avg_experience}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {isCandidate && (
                            <div style={{ background: 'color-mix(in srgb, var(--violet) 8%, transparent)', border: '1px solid var(--violet-border)', borderRadius: 'var(--r-lg)', padding: 20, textAlign: 'center' }}>
                                <div style={{ fontSize: 24, marginBottom: 8 }}>🎤</div>
                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Share Your Experience</div>
                                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>Help other developers prepare.</div>
                                <Link href="/interviews/create" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>Write a Review</Link>
                            </div>
                        )}
                    </div>
                </div>
                <FullFooter />
            </div>
        </MainLayout>
    );
}

function ReviewCard({ review, authUserId }) {
    const oc = OUTCOME_CONFIG[review.outcome] || OUTCOME_CONFIG.pending;
    const isOwner = authUserId === review.user_id;

    function deleteReview() {
        if (!confirm('Delete this review?')) return;
        router.delete(`/interviews/${review.id}`, { preserveScroll: true });
    }

    function Stars({ value, label }) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                <span style={{ color: 'var(--text3)' }}>{label}:</span>
                {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= value ? 'var(--champagne)' : 'var(--surface3)', fontSize: 13 }}>★</span>)}
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>{review.company_name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text3)' }}>{review.role_applied} · {new Date(review.interview_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: `color-mix(in srgb, ${oc.color} 12%, transparent)`, color: oc.color, border: `1px solid color-mix(in srgb, ${oc.color} 30%, transparent)` }}>
                        {oc.icon} {oc.label}
                    </span>
                    {isOwner && <button onClick={deleteReview} style={{ background: 'none', border: '1px solid var(--coral-border)', color: 'var(--coral)', borderRadius: 'var(--r)', padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Delete</button>}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                <Stars value={review.difficulty_rating} label="Difficulty" />
                <Stars value={review.experience_rating} label="Experience" />
            </div>

            {review.rounds_detail?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Rounds ({review.rounds_count})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {review.rounds_detail.map((round, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--surface2)', color: 'var(--violet-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{round.type}</span>
                                        <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 999, background: 'var(--surface2)', color: 'var(--text3)' }}>{round.difficulty}</span>
                                    </div>
                                    {round.description && <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5 }}>{round.description}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {review.tips && (
                <div style={{ background: 'color-mix(in srgb, var(--cyan) 6%, transparent)', border: '1px solid var(--cyan-border)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 12 }}>
                    💡 <strong style={{ color: 'var(--cyan)' }}>Tip:</strong> {review.tips}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
                <span>by {review.user?.name} · {review.user?.total_rank_score?.toLocaleString()} pts</span>
                <span>{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
        </div>
    );
}
