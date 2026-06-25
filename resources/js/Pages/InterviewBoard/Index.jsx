import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

const OUTCOME_CONFIG = {
    selected: { label: 'Selected', cls: 'outcome-selected', icon: '✅' },
    rejected: { label: 'Rejected', cls: 'outcome-rejected', icon: '❌' },
    ghosted:  { label: 'Ghosted',  cls: 'outcome-ghosted',  icon: '👻' },
    pending:  { label: 'Pending',  cls: 'outcome-pending',  icon: '⏳' },
};

const AVATAR_COLORS = ['var(--cyan)', 'var(--purple)', 'var(--champagne)', 'var(--emerald)', 'var(--violet-bright)'];

function initials(name) {
    return (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function avatarColor(name) {
    let h = 0;
    for (const ch of (name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function timeAgo(date) {
    if (!date) return '';
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    const days = Math.floor(diff / 86400);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    return `${Math.floor(months / 12)} year${months >= 24 ? 's' : ''} ago`;
}

export default function InterviewBoardIndex() {
    const { reviews, topCompanies, stats, filters, auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const isCandidate = auth?.user?.roles?.includes('candidate');

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
            <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: 6 }}>Interview Experience Board</h1>
                        <p style={{ color: 'var(--text3)', fontSize: 14, maxWidth: 520 }}>Real, verified interview experiences. Know what to expect before you walk in.</p>
                    </div>
                    <Link href={isCandidate ? '/interviews/create' : '/account'} className="btn btn-primary">+ Share Your Experience</Link>
                </div>

                {/* Stats row */}
                <div className="grid-4" style={{ marginTop: 24, marginBottom: 32 }}>
                    <div className="stat-card">
                        <div className="stat-label">Total Reviews</div>
                        <div className="stat-value">{stats.total.toLocaleString()}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Companies Covered</div>
                        <div className="stat-value">{stats.companies.toLocaleString()}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Avg Difficulty</div>
                        <div className="stat-value">{stats.avg_difficulty}<span style={{ fontSize: '1rem', color: 'var(--text3)' }}>/5</span></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Selection Rate</div>
                        <div className="stat-value">{stats.selection_rate}<span style={{ fontSize: '1rem' }}>%</span></div>
                    </div>
                </div>

                <div className="layout-sidebar-right">
                    {/* Main column */}
                    <div>
                        {/* Filters */}
                        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                            <form onSubmit={submitSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 220 }}>
                                <input type="text" className="form-input" placeholder="🔍  Search company or role…"
                                    value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
                                <button type="submit" className="btn btn-primary btn-sm">Search</button>
                            </form>
                            <select className="form-input" style={{ width: 150 }} value={filters.outcome || ''}
                                onChange={e => applyFilter('outcome', e.target.value)}>
                                <option value="">All Outcomes</option>
                                {Object.entries(OUTCOME_CONFIG).map(([val, cfg]) => (
                                    <option key={val} value={val}>{cfg.icon} {cfg.label}</option>
                                ))}
                            </select>
                            <select className="form-input" style={{ width: 150 }} value={filters.difficulty || ''}
                                onChange={e => applyFilter('difficulty', e.target.value)}>
                                <option value="">All Difficulty</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <select className="form-input" style={{ width: 150 }} value={filters.period || ''}
                                onChange={e => applyFilter('period', e.target.value)}>
                                <option value="">All Time</option>
                                <option value="month">This Month</option>
                                <option value="quarter">Last 3 Months</option>
                                <option value="year">This Year</option>
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

                    {/* Sidebar */}
                    <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)' }}>
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, marginBottom: 16 }}>
                            <h4 style={{ marginBottom: 14 }}>Trending Companies</h4>
                            {topCompanies.length === 0 ? (
                                <div style={{ fontSize: 13, color: 'var(--text3)' }}>No reviews yet.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {topCompanies.slice(0, 6).map((c) => (
                                        <button key={c.company_name} onClick={() => applyFilter('company', filters.company === c.company_name ? '' : c.company_name)}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', textAlign: 'left', fontSize: 13 }}>
                                            <span style={{ color: filters.company === c.company_name ? 'var(--violet-bright)' : 'var(--text2)' }}>{c.company_name}</span>
                                            <span className="badge badge-muted">{c.review_count} reviews</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, marginBottom: 16 }}>
                            <h4 style={{ marginBottom: 14 }}>Outcome Distribution</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <DistRow label="Selected" pct={stats.distribution.selected} color="var(--emerald)" />
                                <DistRow label="Rejected" pct={stats.distribution.rejected} color="var(--coral)" />
                                <DistRow label="Ghosted"  pct={stats.distribution.ghosted}  color="var(--champagne)" />
                            </div>
                        </div>

                        <div style={{ background: 'var(--violet-soft)', border: '1px solid var(--violet-border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
                            <h4 style={{ marginBottom: 8 }}>Share Your Experience</h4>
                            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>Help other developers. Earn rank points for every verified review.</p>
                            <Link href={isCandidate ? '/interviews/create' : '/account'} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>+ Add Review</Link>
                        </div>
                    </div>
                </div>

                <FullFooter />
            </div>
        </MainLayout>
    );
}

function DistRow({ label, pct, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)', width: 64, flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: 8, background: 'var(--bg2)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color, width: 36, textAlign: 'right' }}>{pct}%</span>
        </div>
    );
}

const SENTIMENT = { 5: 'Overall great experience', 4: 'Fair process', 3: 'Mixed experience', 2: 'Below expectations', 1: 'Poor experience' };

function ReviewCard({ review, authUserId }) {
    const oc = OUTCOME_CONFIG[review.outcome] || OUTCOME_CONFIG.pending;
    const isOwner = authUserId === review.user_id;
    const exp = review.experience_rating || 0;

    function deleteReview() {
        if (!confirm('Delete this review?')) return;
        router.delete(`/interviews/${review.id}`, { preserveScroll: true });
    }

    function reportReview() {
        if (!authUserId) { router.visit('/account'); return; }
        if (!confirm('Flag this review for moderation?')) return;
        router.post(`/interviews/${review.id}/report`, {}, { preserveScroll: true });
    }

    return (
        <div className="interview-card">
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="interview-avatar" style={{ color: avatarColor(review.company_name) }}>{initials(review.company_name)}</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{review.company_name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text3)' }}>{review.role_applied} · {timeAgo(review.created_at)}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`outcome-badge ${oc.cls}`}>{oc.icon} {oc.label}</span>
                    <span className="badge badge-cyan">Verified ✓</span>
                    {isOwner && <button onClick={deleteReview} style={{ background: 'none', border: '1px solid var(--coral-border)', color: 'var(--coral)', borderRadius: 'var(--r)', padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Delete</button>}
                </div>
            </div>

            {/* Meta pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <span className="round-pill">🔧 {review.rounds_count} Rounds</span>
                <span className="round-pill">Difficulty: {review.difficulty_rating}/5 ⭐</span>
                <span className="round-pill">Experience: {review.experience_rating}/5 ⭐</span>
            </div>

            {/* Round breakdown */}
            {review.rounds_detail?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>Round Breakdown</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {review.rounds_detail.map((round, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                                <span style={{ color: 'var(--cyan)', fontWeight: 700, width: 24, flexShrink: 0 }}>R{i + 1}</span>
                                <span style={{ color: 'var(--text2)', flex: 1 }}>{round.type}{round.description ? ` — ${round.description}` : ''}</span>
                                <span className={`badge badge-${round.difficulty === 'easy' ? 'green' : round.difficulty === 'hard' ? 'red' : 'amber'}`} style={{ marginLeft: 'auto', textTransform: 'capitalize' }}>{round.difficulty}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips */}
            {review.tips && (
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--champagne)', marginBottom: 6 }}>💡 Tips for Future Candidates</div>
                    <p style={{ fontSize: 14, color: 'var(--text2)', margin: 0 }}>{review.tips}</p>
                </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, letterSpacing: 1 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} style={{ color: s <= exp ? 'var(--champagne)' : 'var(--surface3)' }}>★</span>
                        ))}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text3)' }}>{SENTIMENT[exp] || 'Reviewed'}</span>
                    <span style={{ fontSize: 12, color: 'var(--text4)' }}>· by {review.user?.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="round-pill">👍 {review.likes_count ?? 0} Helpful</span>
                    <button onClick={reportReview} className="btn btn-ghost btn-sm" style={{ color: 'var(--text3)' }}>🚩 Report</button>
                </div>
            </div>
        </div>
    );
}
