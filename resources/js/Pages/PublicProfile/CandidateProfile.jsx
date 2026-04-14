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
                            <div className="profile-header" style={{ alignItems: 'flex-start' }}>
                                <div className="profile-avatar-wrap">
                                    <div className="avatar-xl">{getInitials(user.name)}</div>
                                    {user.open_to_work && <span className="open-to-work">Open to Work</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    {/* Name + Subtitle */}
                                    <h2 style={{ marginTop: 0, marginBottom: '4px', fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15 }}>{user.name}</h2>
                                    <div style={{ fontSize: '15px', color: 'var(--text3)', marginBottom: '12px' }}>
                                        {user.headline || 'Developer'} · {user.location || 'India'}
                                    </div>
                                    {/* Buttons */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <Link href="/account" className="profile-btn-primary">Send Outreach</Link>
                                        <button className="profile-btn-outline">Request Full Profile</button>
                                    </div>
                                    {/* Row 2: Badges */}
                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                                        <div className="human-score">
                                            <div className="hs-bar"><div className="hs-fill" style={{ width: `${user.human_score || 0}%` }}></div></div>
                                            {user.human_score || 0}% Human Score
                                        </div>
                                        {user.years_of_experience && <span className="badge badge-cyan">{user.years_of_experience} Years Exp.</span>}
                                        {user.github_url && <span className="badge badge-green">GitHub Verified</span>}
                                        <span className="badge badge-amber">AWS Certified</span>
                                    </div>
                                    {/* Row 3: Bio */}
                                    <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.7', margin: 0 }}>
                                        {user.bio || 'Passionate developer contributing to the DevRank community. Currently building rank through forum contributions and skill verification.'}
                                    </p>
                                </div>
                            </div>

                            {/* Tag Rankings */}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: '12px' }}>Tag Rankings</div>
                                <div className="rank-showcase">
                                    <div className="rank-tag-card"><div className="rank-val">#1</div><div className="rank-tag-label">React</div></div>
                                    <div className="rank-tag-card"><div className="rank-val">#4</div><div className="rank-tag-label">TypeScript</div></div>
                                    <div className="rank-tag-card"><div className="rank-val">#8</div><div className="rank-tag-label">Performance</div></div>
                                    <div className="rank-tag-card"><div className="rank-val">#11</div><div className="rank-tag-label">GraphQL</div></div>
                                    <div className="rank-tag-card"><div className="rank-val">#15</div><div className="rank-tag-label">Testing</div></div>
                                    <div className="rank-tag-card" style={{ borderStyle: 'dashed', opacity: 0.5 }}>
                                        <div style={{ color: 'var(--text3)', fontWeight: 800, fontSize: '1.4rem' }}>—</div>
                                        <div className="rank-tag-label">+ more tags</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="profile-tabs">
                            <button className={`profile-tab ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>📊 Ranking</button>
                            <button className={`profile-tab ${activeTab === 'answers' ? 'active' : ''}`} onClick={() => setActiveTab('answers')}>💬 Forum Answers</button>
                            <button className={`profile-tab ${activeTab === 'certs' ? 'active' : ''}`} onClick={() => setActiveTab('certs')}>🏅 Certifications</button>
                            <button className={`profile-tab ${activeTab === 'interviews' ? 'active' : ''}`} onClick={() => setActiveTab('interviews')}>🎯 Interviews</button>
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

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                                    <div className="stat-card"><div className="stat-label">Forum Answers</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>{replies_count}</div><div className="stat-change">{likes_received} liked</div></div>
                                    <div className="stat-card"><div className="stat-label">Quizzes Passed</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>8</div><div className="stat-change">6 with distinction</div></div>
                                    <div className="stat-card"><div className="stat-label">Companies Outreached</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>12</div><div className="stat-change">Demand signal</div></div>
                                </div>

                                <div className="dash-card">
                                    <h4 style={{ marginBottom: '14px' }}>Verified Skill Badges</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        <div className="badge badge-cyan" style={{ padding: '8px 14px', fontSize: '13px' }}>⚛️ React — Distinction</div>
                                        <div className="badge badge-cyan" style={{ padding: '8px 14px', fontSize: '13px' }}>📘 TypeScript — Passed</div>
                                        <div className="badge badge-cyan" style={{ padding: '8px 14px', fontSize: '13px' }}>🧪 Testing — Passed</div>
                                        <div className="badge badge-muted" style={{ padding: '8px 14px', fontSize: '13px' }}>🏗️ System Design — Not taken</div>
                                    </div>
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

                        {/* Certifications Tab */}
                        {activeTab === 'certs' && (
                            <div className="dash-card">
                                <h4 style={{ marginBottom: '16px' }}>Verified Certifications</h4>
                                <CertItem icon="☁️" name="AWS Solutions Architect — Associate" issuer="Amazon Web Services · Verified by Admin · Aug 2024" status="verified" />
                                <CertItem icon="⚛️" name="Meta React Developer Certificate" issuer="Coursera · Verified by Admin · Mar 2024" status="verified" />
                                <CertItem icon="📘" name="TypeScript Deep Dive" issuer="Udemy · Self-reported · Pending verification" status="pending" />
                            </div>
                        )}

                        {/* Interviews Tab */}
                        {activeTab === 'interviews' && (
                            <div>
                                <div style={{ background: 'var(--violet-soft)', border: '1px solid var(--violet-border)', borderRadius: 'var(--r)', padding: '12px 16px', fontSize: '13px', color: 'var(--violet-bright)', marginBottom: '16px', display: 'flex', gap: '8px' }}>
                                    <span>🔒</span>
                                    <span>Detailed interview performance is private. Companies see summary stats only after outreach is accepted.</span>
                                </div>
                                <div className="dash-card">
                                    <h4 style={{ marginBottom: '14px' }}>Interview Summary</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                        <div className="stat-card"><div className="stat-label">Screenings Done</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>3</div></div>
                                        <div className="stat-card"><div className="stat-label">Interviews Completed</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>7</div></div>
                                        <div className="stat-card"><div className="stat-label">Offers Received</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>2</div></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)' }}>
                        {/* Rank Score */}
                        <div className="profile-sidebar-card" style={{ textAlign: 'center' }}>
                            <div className="profile-rank-big">{user.total_rank_score?.toLocaleString() || 0}</div>
                            <div className="profile-rank-label">Total Rank Score</div>
                            <hr className="profile-divider" />
                            <div className="profile-rank-row"><span style={{ color: 'var(--text3)' }}>Global Rank</span><strong style={{ color: 'var(--champagne)' }}>#1</strong></div>
                            <div className="profile-rank-row" style={{ marginTop: '8px' }}><span style={{ color: 'var(--text3)' }}>React Rank</span><strong style={{ color: 'var(--cyan)' }}>#1</strong></div>
                            <div className="profile-rank-row" style={{ marginTop: '8px' }}><span style={{ color: 'var(--text3)' }}>TypeScript Rank</span><strong style={{ color: 'var(--cyan)' }}>#4</strong></div>
                            <hr className="profile-divider" />
                            <div className="human-score" style={{ justifyContent: 'center' }}>
                                <div className="hs-bar"><div className="hs-fill" style={{ width: `${user.human_score || 0}%` }}></div></div>
                                {user.human_score || 0}% Human Score
                            </div>
                        </div>

                        {/* Contact & Links */}
                        <div className="profile-sidebar-card">
                            <h4 style={{ marginBottom: '14px' }}>Contact & Links</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <a href={user.github_url || '#'} className="profile-btn-outline" style={{ justifyContent: 'flex-start' }}>🐙 GitHub {user.github_url ? '(verified)' : ''}</a>
                                <a href={user.linkedin_url || '#'} className="profile-btn-outline" style={{ justifyContent: 'flex-start' }}>💼 LinkedIn {user.linkedin_url ? '(linked)' : ''}</a>
                                <div style={{ padding: '8px 14px', fontSize: '13px', color: 'var(--text3)' }}>📧 Email — unlocked after outreach accepted</div>
                                <div style={{ padding: '8px 14px', fontSize: '13px', color: 'var(--text3)' }}>📄 Resume — unlocked after outreach accepted</div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="profile-sidebar-card">
                            <h4 style={{ marginBottom: '12px' }}>Recent Activity</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text2)' }}>
                                <div>💬 Answered: <em>React re-render issue</em></div>
                                <div>❤️ Got {likes_received} new likes on answers</div>
                                <div>🏅 Ranked up to #1 in React</div>
                                <div>📊 3 companies viewed profile</div>
                                <div>🎯 Completed React quiz (Distinction)</div>
                            </div>
                        </div>
                    </div>
                </div>
                <FullFooter />
            </div>
        </MainLayout>
    );
}

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