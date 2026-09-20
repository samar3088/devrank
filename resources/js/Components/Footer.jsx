import { Link } from '@inertiajs/react';

// Social links — placeholder hrefs ("#") until the real profile URLs are supplied.
function SocialLinks() {
    const links = [
        { label: 'LinkedIn', href: '#', path: 'M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0V8zm7.5 0h4.78v2.19h.07c.67-1.2 2.3-2.46 4.73-2.46C22.4 7.73 24 10 24 14.1V24h-5v-8.9c0-2.12-.04-4.85-2.96-4.85-2.96 0-3.41 2.31-3.41 4.7V24h-5V8z' },
        { label: 'X', href: '#', path: 'M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93zm-1.29 19.5h2.04L6.48 3.24H4.29L17.61 20.65z' },
        { label: 'GitHub', href: '#', path: 'M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.92 1.23 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0024 12.5C24 5.87 18.63.5 12 .5z' },
        { label: 'YouTube', href: '#', path: 'M23.5 6.2a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3.02 3.02 0 002.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 002.12-2.14A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z' },
    ];
    return (
        <div className="footer-social">
            {links.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d={s.path} /></svg>
                </a>
            ))}
        </div>
    );
}

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
                        <SocialLinks />
                    </div>
                    <div className="footer-col">
                        <h5>Platform</h5>
                        <ul>
                            <li><Link href="/forum">Forum</Link></li>
                            <li><Link href="/leaderboard">Leaderboard</Link></li>
                            <li><Link href="/jobs">Job Board</Link></li>
                            <li><Link href="/quiz">Skill Quizzes</Link></li>
                            <li><Link href="/interviews">Interview Board</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h5>Company</h5>
                        <ul>
                            <li><Link href="/about">About Us</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h5>Legal</h5>
                        <ul>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                            <li><Link href="/terms">Terms of Service</Link></li>
                            <li><Link href="/cookies">Cookie Policy</Link></li>
                            <li><Link href="/privacy">Contact</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>© {new Date().getFullYear()} DevRank. All rights reserved.</span>
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
                    <span>© {new Date().getFullYear()} DevRank</span>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontSize: '16px' }}>
                        <span className="nav-logo-mark" style={{ width: '24px', height: '24px', fontSize: '10px' }}>DR</span>
                        <span className="nav-logo-text" style={{ fontSize: '16px' }}>Dev<span>Rank</span></span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}