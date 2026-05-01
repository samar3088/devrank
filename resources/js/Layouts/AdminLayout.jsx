import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';

const NAV = [
    {
        section: 'Overview',
        items: [
            { label: 'Dashboard',   icon: '📊', href: '/admin/dashboard',    name: 'admin.dashboard' },
        ],
    },
    {
        section: 'Moderation',
        items: [
            { label: 'Forum Topics',     icon: '📋', href: '/admin/topics',     name: 'admin.topics' },
            { label: 'Flag Queue',       icon: '🚨', href: '/admin/moderation', name: 'admin.moderation', badge: 'flagged_replies' },
            { label: 'Tag Approval',     icon: '🏷️', href: '/admin/tags',       name: 'admin.tags',       badge: 'pending_tags' },
        ],
    },
    {
        section: 'Users & Companies',
        items: [
            { label: 'Candidates',  icon: '👤', href: '/admin/users',     name: 'admin.users' },
            { label: 'Companies',   icon: '🏢', href: '/admin/companies', name: 'admin.companies' },
            { label: 'Job Posts',   icon: '💼', href: '/admin/jobs',      name: 'admin.jobs' },
        ],
    },
    {
        section: 'Platform',
        items: [
            { label: 'Profile Logs', icon: '📜', href: '/admin/profile-logs',  name: 'admin.profile-logs' },
            { label: 'Quiz Mgmt',    icon: '🎯', href: '/admin/quiz',           name: 'admin.quiz.index' },
            { label: 'Analytics', icon: '📈', href: '/admin/analytics', name: 'admin.analytics' },
        ],
    },
];

export default function AdminLayout({ children, title, stats = {} }) {
    const { url } = usePage();

    function isActive(href) {
        return url.startsWith(href);
    }

    return (
        <MainLayout title={title}>
            <div className="admin-layout">

                {/* ── Sidebar ────────────────────────────────── */}
                <aside className="admin-sidebar">
                    <div className="admin-brand">
                        <div className="admin-brand-mark">DR</div>
                        <div>
                            <div className="admin-brand-name">ADMIN PANEL</div>
                            <div className="admin-brand-sub">DevRank · Full Access</div>
                        </div>
                    </div>

                    <nav className="admin-nav">
                        {NAV.map(group => (
                            <div key={group.section}>
                                <div className="admin-nav-section">{group.section}</div>
                                {group.items.map(item => {
                                    const badgeCount = item.badge ? (stats[item.badge] || 0) : 0;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`admin-nav-link${isActive(item.href) ? ' active' : ''}`}
                                        >
                                            <span className="admin-nav-icon">{item.icon}</span>
                                            <span>{item.label}</span>
                                            {badgeCount > 0 && (
                                                <span className="admin-nav-badge">{badgeCount}</span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* ── Main content ───────────────────────────── */}
                <main className="admin-main">
                    {children}
                </main>
            </div>
        </MainLayout>
    );
}
