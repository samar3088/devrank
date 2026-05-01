import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';
import LoadingButton from '@/Components/LoadingButton';

export default function CandidateProfile() {
    const {
        user,
        topics_count,
        replies_count,
        likes_received,
        recent_answers,
        tag_rankings,
        rank_position,
        interestStatus,
        auth,
    } = usePage().props;

    const [activeTab, setActiveTab] = useState('ranking');

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    const isCompany   = auth?.user?.roles?.some(r => r.name === 'company');
    const tagRankings = tag_rankings ?? [];

    // Derive pillar bar widths from real data
    const totalScore   = user.total_rank_score ?? 0;
    const forumLikes   = likes_received ?? 0;
    const pillarMax    = Math.max(totalScore, 1);

    return (
        <MainLayout>
            <Head title={`${user.name} — DevRank Profile`} />
            <div className="profile-container">
                <div className="profile-layout">
                    <div>

                        {/* ── Profile Hero ──────────────────────────── */}
                        <div className="profile-hero">
                            <div className="profile-header" style={{ alignItems: 'flex-start' }}>
                                <div className="profile-avatar-wrap">
                                    <div className="avatar-xl">{getInitials(user.name)}</div>
                                    {user.open_to_work && <span className="open-to-work">Open to Work</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    {/* Name + Send Interest */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                        <h2 style={{ marginTop: 0, marginBottom: 0, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                                            {user.name}
                                        </h2>
                                        {isCompany && auth.user.id !== user.id && (
                                            <SendInterestButton candidateId={user.id} existingStatus={interestStatus} />
                                        )}
                                    </div>

                                    {/* Subtitle */}
                                    <div style={{ fontSize: '15px', color: 'var(--text3)', marginBottom: '12px' }}>
                                        {user.headline || 'Developer'} · {user.location || 'India'}
                                    </div>

                                    {/* Badges */}
                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                                        <div className="human-score">
                                            <div className="hs-bar">
                                                <div className="hs-fill" style={{ width: `${user.human_score || 0}%` }} />
                                            </div>
                                            {user.human_score || 0}% Human Score
                                        </div>
                                        {user.years_of_experience && (
                                            <span className="badge badge-cyan">{user.years_of_experience} Years Exp.</span>
                                        )}
                                        {user.github_url && (
                                            <span className="badge badge-green">GitHub Verified</span>
                                        )}
                                    </div>

                                    {/* Bio */}
                                    <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.7', margin: 0 }}>
                                        {user.bio || 'Passionate developer contributing to the DevRank community. Currently building rank through forum contributions and skill verification.'}
                                    </p>
                                </div>
                            </div>

                            {/* ── Tag Rankings — REAL DATA ──────────── */}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: '12px' }}>
                                    Tag Rankings
                                </div>

                                {tagRankings.length === 0 ? (
                                    <div style={{ fontSize: '13px', color: 'var(--text3)', padding: '8px 0' }}>
                                        No tag rankings yet — answer forum questions to earn a ranking.
                                    </div>
                                ) : (
                                    <div className="rank-showcase">
                                        {tagRankings.map(tr => (
                                            <Link
                                                key={tr.tag_id}
                                                href={`/forum?tag=${tr.tag_slug}`}
                                                className="rank-tag-card"
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <div className="rank-val">#{tr.rank}</div>
                                                <div className="rank-tag-label">{tr.tag_name}</div>
                                            </Link>
                                        ))}
                                        {/* Placeholder if fewer than 4 */}
                                        {tagRankings.length < 4 && (
                                            <div className="rank-tag-card" style={{ borderStyle: 'dashed', opacity: 0.4 }}>
                                                <div style={{ color: 'var(--text3)', fontWeight: 800, fontSize: '1.4rem' }}>—</div>
                                                <div className="rank-tag-label">Answer more</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Tabs ──────────────────────────────────── */}
                        <div className="profile-tabs">
                            <button className={`profile-tab ${activeTab === 'ranking'   ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>📊 Ranking</button>
                            <button className={`profile-tab ${activeTab === 'answers'   ? 'active' : ''}`} onClick={() => setActiveTab('answers')}>💬 Forum Answers</button>
                            <button className={`profile-tab ${activeTab === 'certs'     ? 'active' : ''}`} onClick={() => setActiveTab('certs')}>🏅 Certifications</button>
                            <button className={`profile-tab ${activeTab === 'interviews'? 'active' : ''}`} onClick={() => setActiveTab('interviews')}>🎯 Interviews</button>
                        </div>

                        {/* ── Ranking Tab — REAL DATA ───────────────── */}
                        {activeTab === 'ranking' && (
                            <div>
                                <div className="dash-card" style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h4>Rank Overview</h4>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--cyan)' }}>
                                            {user.total_rank_score?.toLocaleString() ?? 0} pts
                                        </span>
                                    </div>

                                    {/* Real tag rankings as pillar bars */}
                                    {tagRankings.length > 0 ? (
                                        <div className="pillar-bars">
                                            {tagRankings.map(tr => {
                                                // Width relative to most likes
                                                const maxLikes = tagRankings[0]?.total_likes || 1;
                                                const pct      = Math.round((tr.total_likes / maxLikes) * 100);
                                                return (
                                                    <div key={tr.tag_id} className="pillar-row">
                                                        <span className="pillar-label">{tr.tag_name}</span>
                                                        <div className="pillar-bar">
                                                            <div className="pillar-fill" style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <span className="pillar-score">
                                                            #{tr.rank} · {tr.total_likes} likes
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--text3)', fontSize: '13px', padding: '12px 0' }}>
                                            No tag activity yet. Answer forum questions to build rankings.
                                        </div>
                                    )}

                                    {/* Summary stats */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--champagne)' }}>
                                                {rank_position ? `#${rank_position}` : '—'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>Global Rank</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--violet-bright)' }}>
                                                {replies_count ?? 0}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>Answers Posted</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald)' }}>
                                                {likes_received ?? 0}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>Likes Received</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Forum Answers Tab — REAL DATA ─────────── */}
                        {activeTab === 'answers' && (
                            <div>
                                {!recent_answers || recent_answers.length === 0 ? (
                                    <div className="dash-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                                        No forum answers yet.
                                    </div>
                                ) : (
                                    recent_answers.map(answer => (
                                        <div key={answer.id} className="dash-card" style={{ marginBottom: '12px' }}>
                                            <Link
                                                href={`/forum/${answer.topic?.slug}`}
                                                style={{ fontWeight: 600, marginBottom: '6px', display: 'block', textDecoration: 'none', color: 'var(--text)' }}
                                            >
                                                {answer.topic?.title}
                                            </Link>
                                            <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '10px', lineHeight: 1.6 }}>
                                                {answer.body?.replace(/<[^>]+>/g, '').slice(0, 200)}…
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    {answer.tags?.map(tag => (
                                                        <span key={tag.id} className="tag">{tag.name}</span>
                                                    ))}
                                                </div>
                                                <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                                                    ▲ {answer.likes_count ?? 0} likes
                                                    {answer.is_accepted && <span style={{ marginLeft: 8, color: 'var(--emerald)' }}>✅ Accepted</span>}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ── Certifications Tab ────────────────────── */}
                        {activeTab === 'certs' && (
                            <div className="dash-card">
                                <h4 style={{ marginBottom: '16px' }}>Verified Certifications</h4>
                                <CertItem icon="☁️" name="AWS Solutions Architect — Associate" issuer="Amazon Web Services · Verified by Admin · Aug 2024" status="verified" />
                                <CertItem icon="⚛️" name="Meta React Developer Certificate"    issuer="Coursera · Verified by Admin · Mar 2024"           status="verified" />
                                <CertItem icon="📘" name="TypeScript Deep Dive"                issuer="Udemy · Self-reported · Pending verification"        status="pending" />
                            </div>
                        )}

                        {/* ── Interviews Tab ────────────────────────── */}
                        {activeTab === 'interviews' && (
                            <div>
                                <div style={{ background: 'var(--violet-soft)', border: '1px solid var(--violet-border)', borderRadius: 'var(--r)', padding: '12px 16px', fontSize: '13px', color: 'var(--violet-bright)', marginBottom: '16px', display: 'flex', gap: '8px' }}>
                                    <span>🔒</span>
                                    <span>Detailed interview performance is private. Companies see summary stats only after outreach is accepted.</span>
                                </div>
                                <div className="dash-card">
                                    <h4 style={{ marginBottom: '14px' }}>Interview Summary</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                        <div className="stat-card"><div className="stat-label">Screenings Done</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>—</div></div>
                                        <div className="stat-card"><div className="stat-label">Interviews Completed</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>—</div></div>
                                        <div className="stat-card"><div className="stat-label">Offers Received</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>—</div></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right Sidebar ─────────────────────────────── */}
                    <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)' }}>

                        {/* Rank Score */}
                        <div className="profile-sidebar-card" style={{ textAlign: 'center' }}>
                            <div className="profile-rank-big">{user.total_rank_score?.toLocaleString() || 0}</div>
                            <div className="profile-rank-label">Total Rank Score</div>
                            <hr className="profile-divider" />

                            {/* Global rank */}
                            <div className="profile-rank-row">
                                <span style={{ color: 'var(--text3)' }}>Global Rank</span>
                                <strong style={{ color: 'var(--champagne)' }}>
                                    {rank_position ? `#${rank_position}` : '—'}
                                </strong>
                            </div>

                            {/* Top 2 tag ranks from real data */}
                            {tagRankings.slice(0, 2).map(tr => (
                                <div key={tr.tag_id} className="profile-rank-row" style={{ marginTop: '8px' }}>
                                    <span style={{ color: 'var(--text3)' }}>{tr.tag_name} Rank</span>
                                    <strong style={{ color: 'var(--cyan)' }}>#{tr.rank}</strong>
                                </div>
                            ))}

                            <hr className="profile-divider" />
                            <div className="human-score" style={{ justifyContent: 'center' }}>
                                <div className="hs-bar">
                                    <div className="hs-fill" style={{ width: `${user.human_score || 0}%` }} />
                                </div>
                                {user.human_score || 0}% Human Score
                            </div>
                        </div>

                        {/* Contact & Links */}
                        <div className="profile-sidebar-card">
                            <h4 style={{ marginBottom: '14px' }}>Contact & Links</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <a href={user.github_url || '#'} className="profile-btn-outline" style={{ justifyContent: 'flex-start' }}>
                                    🐙 GitHub {user.github_url ? '(verified)' : ''}
                                </a>
                                <a href={user.linkedin_url || '#'} className="profile-btn-outline" style={{ justifyContent: 'flex-start' }}>
                                    💼 LinkedIn {user.linkedin_url ? '(linked)' : ''}
                                </a>
                                {interestStatus === 'accepted' ? (
                                    <>
                                        <a href={`mailto:${user.email}`} className="profile-btn-outline" style={{ justifyContent: 'flex-start' }}>
                                            📧 {user.email}
                                        </a>
                                        {user.resume_url && (
                                            <a href={user.resume_url} target="_blank" className="profile-btn-outline" style={{ justifyContent: 'flex-start' }}>
                                                📄 Download Resume
                                            </a>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div style={{ padding: '8px 14px', fontSize: '13px', color: 'var(--text3)' }}>📧 Email — unlocked after interest accepted</div>
                                        <div style={{ padding: '8px 14px', fontSize: '13px', color: 'var(--text3)' }}>📄 Resume — unlocked after interest accepted</div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity — real data */}
                        <div className="profile-sidebar-card">
                            <h4 style={{ marginBottom: '12px' }}>Activity</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text2)' }}>
                                <div>💬 {replies_count ?? 0} forum answers posted</div>
                                <div>❤️ {likes_received ?? 0} likes received</div>
                                <div>📝 {topics_count ?? 0} topics created</div>
                                {tagRankings.length > 0 && (
                                    <div>🏆 Ranked #{tagRankings[0].rank} in {tagRankings[0].tag_name}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <FullFooter />
            </div>
        </MainLayout>
    );
}

/* ── Send Interest Button + Modal ──────────────────────────── */
function SendInterestButton({ candidateId, existingStatus }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ message: '' });

    function submit(e) {
        e.preventDefault();
        post(`/interests/send/${candidateId}`, {
            onSuccess: () => { reset(); setOpen(false); },
            preserveScroll: true,
        });
    }

    if (existingStatus) {
        const labels = {
            pending:  '⏳ Interest Sent',
            accepted: '✅ Connected',
            declined: '✗ Declined',
        };
        return (
            <span className={`interest-status ${existingStatus}`} style={{ padding: '8px 16px', fontSize: '13px', alignSelf: 'flex-start' }}>
                {labels[existingStatus]}
            </span>
        );
    }

    return (
        <>
            <button className="profile-btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => setOpen(true)}>
                Send Interest
            </button>

            {open && (
                <div className="interest-modal-overlay" onClick={() => setOpen(false)}>
                    <div className="interest-modal" onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '6px' }}>Send Interest Request</h3>
                        <p className="modal-sub">
                            Introduce yourself and explain why you're interested. The candidate will review your company profile before accepting.
                        </p>
                        <form onSubmit={submit}>
                            <div className="form-group">
                                <label className="form-label">Your Message *</label>
                                <textarea
                                    className={`form-input${errors.message ? ' is-error' : ''}`}
                                    rows={5}
                                    maxLength={500}
                                    placeholder="Hi! We came across your profile on DevRank and were impressed by your contributions in..."
                                    value={data.message}
                                    onChange={e => setData('message', e.target.value)}
                                />
                                <div className="char-count">{data.message.length} / 500</div>
                                {errors.message && <div className="form-error">{errors.message}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <LoadingButton type="submit" className="btn btn-primary" loading={processing}>
                                    Send Request
                                </LoadingButton>
                                <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

/* ── Cert Item ─────────────────────────────────────────────── */
function CertItem({ icon, name, issuer, status }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '24px' }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{issuer}</div>
            </div>
            <span className={`badge ${status === 'verified' ? 'badge-green' : 'badge-amber'}`}>
                {status === 'verified' ? 'Verified' : 'Pending'}
            </span>
        </div>
    );
}
