import '../../css/layouts/company.css';
import { Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function CompanyLayout({ children, fullWidthHeader }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    function isActive(path) {
        if (path === '/dashboard') return currentPath === '/dashboard';
        if (path === '/company/jobs') return currentPath === '/company/jobs';
        if (path === '/company/jobs/create') return currentPath === '/company/jobs/create';
        return currentPath.startsWith(path);
    }

    const monthlyJobPosts = 5;
    const postsUsed = user?.monthly_job_posts || 0;

    const navItems = [
        { section: 'Overview' },
        { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
        { href: '/company/trust-score', icon: '⭐', label: 'Trust Score' },

        { section: 'Hiring' },
        { href: '/company/applicants', icon: '👥', label: 'Applicants' },
        { href: '/company/jobs', icon: '💼', label: 'My Jobs' },
        { href: '/company/jobs/create', icon: '➕', label: 'Post New Job' },

        { section: 'Discovery' },
        { href: '/company/outreach', icon: '📤', label: 'Outreach Sent' },
        { href: '/company/browse-talent', icon: '🏆', label: 'Browse Talent' },

        { section: 'Account' },
        { href: '/company/profile', icon: '🏢', label: 'Company Profile' },
    ];

    return (
        <MainLayout>
            <div className="company-page">
                {/* Full width header (above the grid) */}
                {fullWidthHeader && (
                    <div>{fullWidthHeader}</div>
                )}

                {/* Sidebar + Content grid */}
                <div className="dash-layout">
                    {/* Sidebar */}
                    <div className="dash-sidebar">
                        <nav className="dash-nav">
                            {navItems.map((item, i) => {
                                if (item.section) {
                                    return (
                                        <div key={i} className="dash-nav-section">
                                            {item.section}
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`dash-nav-link ${isActive(item.href) ? 'active' : ''}`}
                                    >
                                        <span className="dash-nav-icon">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Plan Card */}
                        <div className="company-plan-card">
                            <div className="company-plan-label">Current Plan</div>
                            <div className="company-plan-name">Freemium</div>
                            <div className="company-plan-usage">
                                {postsUsed}/{monthlyJobPosts} job posts · 1 free screening/job
                            </div>
                            <div className="company-plan-bar">
                                <div
                                    className="company-plan-bar-fill"
                                    style={{ width: `${(postsUsed / monthlyJobPosts) * 100}%` }}
                                ></div>
                            </div>
                            <Link href="/company/upgrade" className="company-plan-upgrade-btn">
                                Upgrade Plan
                            </Link>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div>
                        {children}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}