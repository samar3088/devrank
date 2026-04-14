import { Link } from '@inertiajs/react';

export function FullFooter() {
    return (
        <footer className="home-footer">
            <div className="home-container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                            <span className="nav-logo-mark">DR</span>
                            <span className="nav-logo-text">Dev<span>Rank</span></span>
                        </Link>
                        <p>The platform where developer knowledge builds careers. Transparent hiring for everyone.</p>
                    </div>
                    <div className="footer-col">
                        <h5>Platform</h5>
                        <ul>
                            <li><Link href="/forum">Forum</Link></li>
                            <li><Link href="/leaderboard">Leaderboard</Link></li>
                            <li><Link href="/jobs">Job Board</Link></li>
                            <li><Link href="/quizzes">Skill Quizzes</Link></li>
                            <li><Link href="/interviews">Interview Board</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h5>Company</h5>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">Press</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h5>Legal</h5>
                        <ul>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Cookie Policy</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>© 2026 DevRank. All rights reserved.</span>
                    <span>Made with 🔥 for developers who know their stuff</span>
                </div>
            </div>
        </footer>
    );
}

export function SimpleFooter() {
    return (
        <footer className="home-footer" style={{ marginTop: '0', padding: '24px 0' }}>
            <div className="home-container">
                <div className="footer-bottom" style={{ borderTop: 'none', paddingTop: '0' }}>
                    <span>© 2026 DevRank</span>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontSize: '16px' }}>
                        <span className="nav-logo-mark" style={{ width: '24px', height: '24px', fontSize: '10px' }}>DR</span>
                        <span className="nav-logo-text" style={{ fontSize: '16px' }}>Dev<span>Rank</span></span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}