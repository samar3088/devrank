import '../../css/layouts/main.css';
import PageLoader from '@/Components/PageLoader';
import { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function MainLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Get user initials for avatar
    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get nav links based on role
    function getNavLinks() {
        const links = [
            { href: '/forum', label: 'Forum' },
            { href: '/leaderboard', label: 'Leaderboard' },
            { href: '/jobs', label: 'Jobs' },
            { href: '/interviews', label: 'Interviews' },
        ];

        if (user?.roles?.includes('super_admin') || user?.roles?.includes('sub_admin')) {
            links.push({ href: '/admin', label: 'Admin' });
        }

        return links;
    }

    // Check if link is active
    function isActive(href) {
        const currentUrl = window.location.pathname;
        return currentUrl.startsWith(href);
    }

    return (
        <>
            <PageLoader />
            <nav className="navbar">
                <div className="navbar-inner">
                    {/* Logo */}
                    <Link href="/" className="nav-logo">
                        <span className="nav-logo-mark">DR</span>
                        <span className="nav-logo-text">Dev<span>Rank</span></span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="nav-links">
                        {getNavLinks().map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="nav-actions">
                        {user ? (
                            <>
                                {/* Notifications */}
                                <button className="nav-notification">
                                    🔔
                                    <span className="nav-notification-badge"></span>
                                </button>

                                {/* User Menu */}
                                <div style={{ position: 'relative' }} ref={dropdownRef}>
                                    <div
                                        className="nav-user"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                    >
                                        <div className="nav-avatar">
                                            {getInitials(user.name)}
                                        </div>
                                        <span className="nav-user-name">{user.name}</span>
                                    </div>

                                    {/* Dropdown */}
                                    {dropdownOpen && (
                                        <div className="nav-dropdown">
                                            <Link
                                                href="/dashboard"
                                                className="nav-dropdown-item"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                📊 Dashboard
                                            </Link>
                                            <Link
                                                href="/profile"
                                                className="nav-dropdown-item"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                👤 My Profile
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="nav-dropdown-item"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                ⚙️ Settings
                                            </Link>
                                            <hr className="nav-dropdown-divider" />
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="nav-dropdown-item"
                                                style={{ color: 'var(--coral)' }}
                                                onClick={(e) => {
                                                    if (e.currentTarget.disabled) {
                                                        e.preventDefault();
                                                        return;
                                                    }
                                                    e.currentTarget.disabled = true;
                                                }}
                                            >
                                                🚪 Logout
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/register" className="nav-link">Log In</Link>
                                <Link
                                    href="/register"
                                    style={{
                                        background: 'var(--violet)',
                                        color: '#fff',
                                        padding: '6px 16px',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <div className="page-wrapper">
                {children}
            </div>
        </>
    );
}