import '../../css/layouts/main.css';
import { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import PageLoader from '@/Components/PageLoader';

export default function MainLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const roles = user?.roles || [];
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isAdmin = roles.includes('super_admin') || roles.includes('sub_admin');
    const isCompany = roles.includes('company');
    const isCandidate = roles.includes('candidate');

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    function getAvatarBorderColor() {
        if (isAdmin) return 'var(--coral)';
        if (isCompany) return 'var(--champagne)';
        return 'var(--cyan)';
    }

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Nav links based on role
    function getNavLinks() {
        if (isAdmin) return []; // Admin has no top nav links

        const links = [
            { href: '/forum', label: 'Forum' },
            { href: '/leaderboard', label: 'Leaderboard' },
            { href: '/jobs', label: 'Jobs' },
            { href: '/interviews', label: 'Interviews' },
        ];

        // Company doesn't see Quizzes
        if (!isCompany) {
            links.push({ href: '/quizzes', label: 'Quizzes' });
        }

        return links;
    }

    function isActive(href) {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        if (href === '/') return currentPath === '/';
        return currentPath.startsWith(href);
    }

    function handleLogout(e) {
        e.preventDefault();
        if (e.currentTarget.disabled) return;
        e.currentTarget.disabled = true;
        router.post('/logout');
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

                    {/* Nav Links */}
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
                                {/* Admin Mode Badge */}
                                {isAdmin && (
                                    <span className="nav-admin-badge">🔴 Admin Mode</span>
                                )}

                                {/* Company Name (for company users) */}
                                {isCompany && user.company_name && (
                                    <span className="nav-company-name">{user.company_name}</span>
                                )}

                                {/* Avatar */}
                                <div style={{ position: 'relative' }} ref={dropdownRef}>
                                    <div
                                        className="nav-user-pill"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                    >
                                        <div
                                            className="nav-avatar"
                                            style={{ borderColor: getAvatarBorderColor() }}
                                        >
                                            {getInitials(isCompany ? user.company_name : user.name)}
                                        </div>
                                        <span className="nav-user-name">
                                            {isAdmin ? (roles.includes('super_admin') ? 'Super Admin' : 'Sub Admin') : user.name}
                                        </span>
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
                                            {isCompany && (
                                                <Link
                                                    href="/company/profile"
                                                    className="nav-dropdown-item"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    🏢 Company Profile
                                                </Link>
                                            )}
                                            {isCandidate && (
                                                <Link
                                                    href="/profile"
                                                    className="nav-dropdown-item"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    👤 My Profile
                                                </Link>
                                            )}
                                            {isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    className="nav-dropdown-item"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    ⚙️ Admin Panel
                                                </Link>
                                            )}
                                            <hr className="nav-dropdown-divider" />
                                            <button
                                                onClick={handleLogout}
                                                className="nav-dropdown-item"
                                                style={{ color: 'var(--coral)' }}
                                            >
                                                🚪 Log Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/account" className="nav-btn-outline">Log In</Link>
                                <Link href="/account" className="nav-btn-primary">Get Started</Link>
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