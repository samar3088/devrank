import '../../css/pages/home.css';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

export default function Home() {
    return (
        <MainLayout>
            <Head title="Where Knowledge Builds Careers" />

            {/* ── Hero ──────────────────────────────────────── */}
            <section className="hero">
                <div className="hero-inner">
                    <div>
                        <div className="hero-eyebrow">🚀 The Future of Tech Hiring</div>
                        <h1>Your <em>Knowledge</em> Is Your Resume</h1>
                        <p className="hero-desc">
                            DevRank ranks developers by what they actually know — verified forum answers, skill quizzes, and real interview performance. Companies find the best talent. Candidates get fair, transparent hiring.
                        </p>
                        <div className="hero-cta">
                            <Link href="/account" className="btn-hero btn-hero-primary">Join as Candidate</Link>
                            <Link href="/account" className="btn-hero btn-hero-outline">Post Jobs as Company</Link>
                        </div>
                        <div className="hero-stats">
                            <div>
                                <div className="hero-stat-value">24,800+</div>
                                <div className="hero-stat-label">Ranked Developers</div>
                            </div>
                            <div>
                                <div className="hero-stat-value">1,340</div>
                                <div className="hero-stat-label">Companies Hiring</div>
                            </div>
                            <div>
                                <div className="hero-stat-value">98%</div>
                                <div className="hero-stat-label">Human-Verified Answers</div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Card Stack */}
                    <div className="hero-visual">
                        <div className="hero-card-stack">
                            <div className="hcard hcard-1">
                                <div className="hcard-rank-row">
                                    <div className="rank-badge gold">#1</div>
                                    <div className="home-avatar">AK</div>
                                    <div>
                                        <div className="hcard-name">Arjun Kumar</div>
                                        <div className="hcard-tag">React · #1 Globally</div>
                                    </div>
                                </div>
                                <div className="hcard-bars">
                                    <div className="hcard-bar-row">Forum <div className="bar"><span style={{width:'92%'}}></span></div> 92</div>
                                    <div className="hcard-bar-row">Quiz <div className="bar"><span style={{width:'88%'}}></span></div> 88</div>
                                    <div className="hcard-bar-row">Interviews <div className="bar"><span style={{width:'95%'}}></span></div> 95</div>
                                </div>
                                <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'16px'}}>
                                    <div className="human-score">
                                        <div className="hs-bar"><div className="hs-fill" style={{width:'96%'}}></div></div>
                                        96% Human
                                    </div>
                                    <span className="home-badge home-badge-violet">Verified</span>
                                </div>
                            </div>

                            <div className="hcard hcard-2">
                                <div className="hcard-rank-row">
                                    <div className="rank-badge silver">#2</div>
                                    <div className="home-avatar">PS</div>
                                    <div>
                                        <div className="hcard-name">Priya Sharma</div>
                                        <div className="hcard-tag">Node.js · #2 Globally</div>
                                    </div>
                                </div>
                                <div className="home-tags" style={{marginTop:'8px'}}>
                                    <span className="home-tag">Node.js</span>
                                    <span className="home-tag">MongoDB</span>
                                    <span className="home-tag">AWS</span>
                                </div>
                            </div>

                            <div className="hcard hcard-3">
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                                    <span className="home-badge home-badge-gold">🏅 Transparent Employer</span>
                                    <span style={{color:'var(--champagne)',letterSpacing:'1px',fontSize:'14px'}}>★★★★★</span>
                                </div>
                                <div className="hcard-name">Infosys BPM</div>
                                <div style={{color:'var(--text3)',fontSize:'13px',marginTop:'8px'}}>Trust Score: 91/100 · 42 Hires</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── How It Works ───────────────────────────────── */}
            <section className="home-section">
                <div className="home-container">
                    <div className="section-header">
                        <span className="section-eyebrow">How It Works</span>
                        <h2>Hiring That Actually Makes Sense</h2>
                        <p>Three roles. One transparent platform. Zero ghosting.</p>
                    </div>

                    <div className="how-grid">
                        <div className="how-item">
                            <div className="how-number">01</div>
                            <h3>Candidates Build Real Rank</h3>
                            <p>Answer forum questions, pass skill quizzes, complete verified interviews. Every action builds a transparent, multi-pillar rank score — not just years of experience.</p>
                        </div>
                        <div className="how-item">
                            <div className="how-number">02</div>
                            <h3>Companies Find Verified Talent</h3>
                            <p>Browse ranked candidates by technology tag. Request free first screening. Send direct outreach to top developers — without posting a job first.</p>
                        </div>
                        <div className="how-item">
                            <div className="how-number">03</div>
                            <h3>Transparent Outcomes For All</h3>
                            <p>Mandatory rejection reasons. Interview experience reviews. Company trust scores. Everyone knows where they stand and why.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Leaderboard Preview ────────────────────────── */}
            <section className="home-section" style={{paddingTop:0}}>
                <div className="home-container">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px',flexWrap:'wrap',gap:'16px'}}>
                        <div>
                            <span className="section-eyebrow" style={{marginBottom:'8px',display:'block'}}>Live Rankings</span>
                            <h2 style={{fontSize:'clamp(1.8rem, 3vw, 2.2rem)',fontWeight:700,letterSpacing:'-0.03em'}}>Top Ranked Developers</h2>
                        </div>
                        <Link href="/leaderboard" className="btn-hero btn-hero-outline" style={{padding:'9px 20px',fontSize:'14px'}}>View Full Leaderboard →</Link>
                    </div>

                    <div className="lb-preview">
                        <div className="lb-header">
                            <div style={{display:'flex',gap:'8px'}}>
                                <span className="home-badge home-badge-violet">React</span>
                                <span className="home-badge home-badge-muted">Node.js</span>
                                <span className="home-badge home-badge-muted">Laravel</span>
                                <span className="home-badge home-badge-muted">System Design</span>
                            </div>
                            <span style={{fontSize:'13px',color:'var(--text3)'}}>Updated hourly</span>
                        </div>

                        <div className="lb-row" style={{background:'var(--surface)',borderBottom:'1px solid var(--border2)'}}>
                            <span style={{fontSize:'11px',color:'var(--text3)',fontWeight:700,textTransform:'uppercase'}}>Rank</span>
                            <span style={{fontSize:'11px',color:'var(--text3)',fontWeight:700,textTransform:'uppercase'}}>Candidate</span>
                            <span style={{fontSize:'11px',color:'var(--text3)',fontWeight:700,textTransform:'uppercase'}}>Human Score</span>
                            <span style={{fontSize:'11px',color:'var(--text3)',fontWeight:700,textTransform:'uppercase'}}>Tags</span>
                            <span style={{fontSize:'11px',color:'var(--text3)',fontWeight:700,textTransform:'uppercase'}}>Score</span>
                        </div>

                        <LeaderboardRow rank="#1" rankClass="gold" initials="AK" name="Arjun Kumar" city="Bengaluru" score="96%" tags={['React','TypeScript']} points="4,820" />
                        <LeaderboardRow rank="#2" rankClass="silver" initials="PS" name="Priya Sharma" city="Mumbai" score="94%" tags={['Node.js','MongoDB']} points="4,610" />
                        <LeaderboardRow rank="#3" rankClass="bronze" initials="RV" name="Rohan Verma" city="Hyderabad" score="91%" tags={['Laravel','MySQL']} points="4,390" />
                        <LeaderboardRow rank="#4" rankClass="" initials="MN" name="Meera Nair" city="Pune" score="89%" tags={['System Design']} points="4,205" />
                        <LeaderboardRow rank="#5" rankClass="" initials="SK" name="Siddharth Khan" city="Delhi" score="93%" tags={['AWS','Docker']} points="4,120" />
                    </div>
                </div>
            </section>

            {/* ── Company Trust System ────────────────────────── */}
            <section className="home-section">
                <div className="home-container">
                    <div className="trust-section-grid">
                        <div>
                            <span className="trust-eyebrow">Company Trust System</span>
                            <h2 style={{fontSize:'clamp(1.8rem, 3vw, 2.2rem)',fontWeight:700,letterSpacing:'-0.03em',marginBottom:'16px'}}>Companies Earn Their Reputation Too</h2>
                            <p style={{color:'var(--text2)',fontSize:'16px',lineHeight:'1.7',marginBottom:'28px'}}>Every company gets a transparent Trust Score based on how they treat candidates — ghosting rate, feedback quality, verified hires, and work environment reviews.</p>
                            <div className="badge-showcase">
                                <div className="badge-card">🏅 Transparent Employer</div>
                                <div className="badge-card">⚡ Fast Responder</div>
                                <div className="badge-card">✅ Trusted Hirer</div>
                                <div className="badge-card">❤️ Candidate Friendly</div>
                                <div className="badge-card">🌟 Top Rated Company</div>
                            </div>
                            <p style={{marginTop:'20px',fontSize:'13px',color:'var(--text3)'}}>Badges auto-awarded based on real platform data. Cannot be bought.</p>
                        </div>
                        <div className="trust-card">
                            <div className="trust-gauge-score">87</div>
                            <div className="trust-gauge-label">Trust Score / 100</div>
                            <hr className="home-divider" />
                            <div className="pillar-bars" style={{marginTop:'16px'}}>
                                <div className="pillar-row"><span className="pillar-label">Hiring Process</span><div className="pillar-bar"><div className="pillar-fill" style={{width:'91%'}}></div></div><span className="pillar-score">91</span></div>
                                <div className="pillar-row"><span className="pillar-label">Candidate Exp.</span><div className="pillar-bar"><div className="pillar-fill" style={{width:'85%'}}></div></div><span className="pillar-score">85</span></div>
                                <div className="pillar-row"><span className="pillar-label">Engagement</span><div className="pillar-bar"><div className="pillar-fill" style={{width:'82%'}}></div></div><span className="pillar-score">82</span></div>
                                <div className="pillar-row"><span className="pillar-label">Hiring Outcomes</span><div className="pillar-bar"><div className="pillar-fill" style={{width:'88%'}}></div></div><span className="pillar-score">88</span></div>
                            </div>
                            <div style={{display:'flex',gap:'8px',justifyContent:'center',marginTop:'24px'}}>
                                <span className="home-badge home-badge-gold">🏅 Transparent Employer</span>
                                <span className="home-badge home-badge-violet">✅ Trusted Hirer</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Testimonials ────────────────────────────────── */}
            <section className="home-section" style={{paddingTop:0}}>
                <div className="home-container">
                    <div className="section-header">
                        <span className="section-eyebrow">What People Say</span>
                        <h2>Built for Real People</h2>
                    </div>
                    <div className="testimonial-grid">
                        <div className="testimonial">
                            <div className="testimonial-stars">★★★★★</div>
                            <p className="testimonial-text">"I got 3 direct outreach messages from companies within a week of reaching #8 in React. No resume needed — my answers spoke for themselves."</p>
                            <div className="testimonial-author">
                                <div className="home-avatar">AK</div>
                                <div>
                                    <div className="testimonial-name">Arjun Kumar</div>
                                    <div className="testimonial-role">Frontend Developer · #1 in React</div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial">
                            <div className="testimonial-stars">★★★★★</div>
                            <p className="testimonial-text">"The mandatory rejection feedback was a game-changer for us. It forced our team to be more thoughtful, and we actually improved our hiring process."</p>
                            <div className="testimonial-author">
                                <div className="home-avatar" style={{color:'var(--champagne)'}}>HR</div>
                                <div>
                                    <div className="testimonial-name">Harshit Rao</div>
                                    <div className="testimonial-role">CTO · TechVentures India</div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial">
                            <div className="testimonial-stars">★★★★☆</div>
                            <p className="testimonial-text">"The interview board saved me hours of prep. I knew exactly what to expect in my Infosys interview — rounds, topics, difficulty. I was fully prepared."</p>
                            <div className="testimonial-author">
                                <div className="home-avatar" style={{color:'var(--emerald)'}}>PS</div>
                                <div>
                                    <div className="testimonial-name">Priya Sharma</div>
                                    <div className="testimonial-role">Backend Developer · Mumbai</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ──────────────────────────────────── */}
            <section className="home-section-sm">
                <div className="home-container">
                    <div className="cta-banner">
                        <span className="section-eyebrow" style={{marginBottom:'16px'}}>Start Today — Free</span>
                        <h2>Ready to Build Your Real Rank?</h2>
                        <p>Join 24,000+ developers who are getting hired based on what they know, not just what's on their CV.</p>
                        <div className="cta-buttons">
                            <Link href="/account" className="btn-hero btn-hero-primary">Join as Developer</Link>
                            <Link href="/account" className="btn-hero btn-hero-outline">Hire on DevRank</Link>
                        </div>
                    </div>
                </div>
            </section>

            <FullFooter />
        </MainLayout>
    );
}

function LeaderboardRow({ rank, rankClass, initials, name, city, score, tags, points }) {
    return (
        <div className="lb-row">
            <div className={`rank-badge ${rankClass}`}>{rank}</div>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <div className="home-avatar">{initials}</div>
                <div>
                    <div style={{fontWeight:600,fontSize:'14px'}}>{name}</div>
                    <div style={{fontSize:'11px',color:'var(--text3)'}}>{city}</div>
                </div>
            </div>
            <div className="human-score">
                <div className="hs-bar"><div className="hs-fill" style={{width:score}}></div></div>
                {score}
            </div>
            <div className="home-tags">
                {tags.map(tag => <span key={tag} className="home-tag">{tag}</span>)}
            </div>
            <div className="lb-score">{points}</div>
        </div>
    );
}