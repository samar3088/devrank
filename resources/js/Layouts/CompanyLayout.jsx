import '../../css/layouts/company.css';
import { Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function CompanyLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    function isActive(path) {
        if (path === '/dashboard' && currentPath === '/dashboard') return true;
        if (path !== '/dashboard' && currentPath.startsWith(path)) return true;
        return false;
    }

    const monthlyJobPosts = 5;
    const postsUsed = user?.monthly_job_posts || 0;

    const navItems = [
        { section: 'Overview' },
        { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
        { href: '/company/trust-score', icon: '⭐', label: 'Trust Score' },

        { section: 'Hiring' },
        { href: '/company/jobs', icon: '💼', label: 'My Jobs' },
        { href: '/company/jobs/create', icon: '➕', label: 'Post New Job' },
        { href: '/company/applicants', icon: '👥', label: 'Applicants' },

        { section: 'Discovery' },
        { href: '/company/outreach', icon: '📤', label: 'Outreach Sent' },
        { href: '/company/browse-talent', icon: '🏆', label: 'Browse Talent' },

        { section: 'Account' },
        { href: '/company/profile', icon: '🏢', label: 'Company Profile' },
    ];

    return (
        <MainLayout>
            <div className="company-layout">
                <aside className="company-sidebar">
                    <div className="company-sidebar-header">
                        <div className="company-sidebar-name">
                            {user?.company_name || user?.name || 'Company'}
                        </div>
                        <div className="company-sidebar-role">Company Account</div>
                    </div>

                    <nav className="company-nav">
                        {navItems.map((item, i) => {
                            if (item.section) {
                                return (
                                    <div key={i} className="company-nav-section">
                                        {item.section}
                                    </div>
                                );
                            }
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`company-nav-link ${isActive(item.href) ? 'active' : ''}`}
                                >
                                    <span className="company-nav-icon">{item.icon}</span>
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
                </aside>

                <div className="company-content">
                    {children}
                </div>
            </div>
        </MainLayout>
    );
}