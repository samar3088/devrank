import '../../../css/pages/public-profile.css';
import '../../../css/pages/forum.css';
import '../../../css/pages/home.css';
import '../../../css/pages/dashboard-company.css';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

export default function CandidateProfile() {
    const { user, topics_count, replies_count, likes_received, recent_answers } = usePage().props;
    const [activeTab, setActiveTab] = useState('ranking');

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    return (
        <MainLayout>
            <Head title={`${user.name} — DevRank Profile`} />
            <div className="profile-container">
                <div className="profile-layout">
                    <div>
                        {/* Profile Hero */}
                        <div className="profile-hero">
                            <div className="profile-header">
                                <div className="profile-avatar-wrap">
                                    <div className="avatar-xl">{getInitials(user.name)}</div>
                                    {user.open_to_work && <span className="open-to-work">Open to Work</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                                        <div>
                                            <div className="profile-name">{user.name}</div>
                                            <div className="profile-headline">{user.headline || 'Developer'} · {user.location || 'India'}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <Link href="/account" className="btn-sm btn-primary-sm">Send Outreach</Link>
                                            <button className="btn-sm btn-outline-sm">Request Full Profile</button>
                                        </div>
                                    </div>
                                    <div className="profile-badges">
                                        <div className="human-score">
                                            <div className="hs-bar"><div className="hs-fill" style={{ width: `${user.human_score || 0}%` }}></div></div>
                                            {user.human_score || 0}% Human Score
                                        </div>
                                        {user.years_of_experience && <span className="badge badge-cyan">{user.years_of_experience} Years Exp.</span>}
                                        {user.github_url && <span className="badge badge-green">GitHub Verified</span>}
                                    </div>
                                    {user.bio && <p className="profile-bio">{user.bio}</p>}
                                </div>
                            </div>
                            <div className="rank-showcase">
                                <div className="rank-tag-card"><div className="rank-val">#1</div><div className="rank-tag-label">React</div></div>
                                <div className="rank-tag-card"><div className="rank-val">#4</div><div className="rank-tag-label">TypeScript</div></div>
                                <div className="rank-tag-card"><div className="rank-val">#8</div><div className="rank-tag-label">Performance</div></div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="profile-tabs">
                            <button className={`profile-tab ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>📊 Ranking</button>
                            <button className={`profile-tab ${activeTab === 'answers' ? 'active' : ''}`} onClick={() => setActiveTab('answers')}>💬 Forum Answers</button>
                        </div>

                        {/* Ranking Tab */}
                        {activeTab === 'ranking' && (
                            <div>
                                <div className="dash-card" style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h4>5-Pillar Rank Breakdown</h4>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--cyan)' }}>{user.total_rank_score?.toLocaleString()} pts</span>
                                    </div>
                                    <div className="pillar-bars">
                                        <div className="pillar-row"><span className="pillar-label">Forum Contributions</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '92%' }}></div></div><span className="pillar-score">1,240</span></div>
                                        <div className="pillar-row"><span className="pillar-label">Quiz Performance</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '85%' }}></div></div><span className="pillar-score">980</span></div>
                                        <div className="pillar-row"><span className="pillar-label">Interview Performance</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '98%' }}></div></div><span className="pillar-score">1,450</span></div>
                                        <div className="pillar-row"><span className="pillar-label">Profile Credibility</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '72%' }}></div></div><span className="pillar-score">620</span></div>
                                        <div className="pillar-row"><span className="pillar-label">Demand Signals</span><div className="pillar-bar"><div className="pillar-fill" style={{ width: '68%' }}></div></div><span className="pillar-score">530</span></div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                    <div className="stat-card"><div className="stat-label">Forum Answers</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>{replies_count}</div><div className="stat-change">{likes_received} liked</div></div>
                                    <div className="stat-card"><div className="stat-label">Topics Created</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>{topics_count}</div></div>
                                    <div className="stat-card"><div className="stat-label">Total Likes</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>{likes_received}</div></div>
                                </div>
                            </div>
                        )}

                        {/* Answers Tab */}
                        {activeTab === 'answers' && (
                            <div>
                                {recent_answers?.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>No forum answers yet.</div>
                                ) : (
                                    recent_answers.map(answer => (
                                        <div key={answer.id} className="answer-preview">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <Link href={`/forum/${answer.topic_slug}`} className="answer-preview-title">{answer.topic_title}</Link>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    {answer.is_accepted && <span className="badge badge-green">Accepted</span>}
                                                    <span style={{ color: 'var(--cyan)', fontSize: '13px' }}>+{answer.likes_count} ❤️</span>
                                                </div>
                                            </div>
                                            <p className="answer-preview-body">{answer.body_preview}</p>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {answer.tags?.map(tag => (
                                                    <span key={tag.id} className="tag">{tag.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)' }}>
                        <div className="profile-sidebar-card" style={{ textAlign: 'center' }}>
                            <div className="profile-rank-big">{user.total_rank_score?.toLocaleString() || 0}</div>
                            <div className="profile-rank-label">Total Rank Score</div>
                            <hr className="profile-divider" />
                            <div className="profile-rank-row"><span style={{ color: 'var(--text3)' }}>Global Rank</span><strong style={{ color: 'var(--champagne)' }}>#1</strong></div>
                            <hr className="profile-divider" />
                            <div className="human-score" style={{ justifyContent: 'center' }}>
                                <div className="hs-bar"><div className="hs-fill" style={{ width: `${user.human_score || 0}%` }}></div></div>
                                {user.human_score || 0}% Human Score
                            </div>
                        </div>

                        <div className="profile-sidebar-card">
                            <h4 style={{ marginBottom: '14px' }}>Contact & Links</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {user.github_url ? (
                                    <a href={user.github_url} target="_blank" className="btn-sm btn-outline-sm" style={{ justifyContent: 'flex-start' }}>🐙 GitHub (verified)</a>
                                ) : (
                                    <span className="btn-sm btn-outline-sm" style={{ opacity: 0.5, cursor: 'default' }}>🐙 GitHub</span>
                                )}
                                {user.linkedin_url ? (
                                    <a href={user.linkedin_url} target="_blank" className="btn-sm btn-outline-sm" style={{ justifyContent: 'flex-start' }}>💼 LinkedIn (linked)</a>
                                ) : (
                                    <span className="btn-sm btn-outline-sm" style={{ opacity: 0.5, cursor: 'default' }}>💼 LinkedIn</span>
                                )}
                                <div style={{ padding: '6px 14px', fontSize: '13px', color: 'var(--text3)' }}>📧 Email — unlocked after outreach accepted</div>
                                <div style={{ padding: '6px 14px', fontSize: '13px', color: 'var(--text3)' }}>📄 Resume — unlocked after outreach accepted</div>
                            </div>
                        </div>
                    </div>
                </div>
                <FullFooter />
            </div>
        </MainLayout>
    );
}