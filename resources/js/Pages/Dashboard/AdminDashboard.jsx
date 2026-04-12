import { Head, usePage, Link } from '@inertiajs/react';

export default function AdminDashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Admin Dashboard" />
            <div style={{
                minHeight: '100vh',
                background: '#0d0f1a',
                color: '#fff',
                fontFamily: "'Geist', system-ui, sans-serif",
                padding: '48px',
            }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ color: '#7880a8' }}>
                        Welcome back, {auth.user.name}!
                        <span style={{
                            marginLeft: '12px',
                            background: 'rgba(124,109,250,.09)',
                            border: '1px solid rgba(124,109,250,.28)',
                            color: '#9d91ff',
                            padding: '2px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                        }}>
                            {auth.user.roles[0]}
                        </span>
                    </p>
                </div>

                <p style={{ color: '#7880a8', marginBottom: '24px' }}>
                    Full admin panel coming soon — manage users, companies, forum, jobs, and analytics.
                </p>

                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    style={{
                        background: '#7c6dfa',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                    }}
                >
                    Logout
                </Link>
            </div>
        </>
    );
}