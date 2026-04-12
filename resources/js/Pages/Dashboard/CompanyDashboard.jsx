import { Head, usePage, Link } from '@inertiajs/react';

export default function CompanyDashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Company Dashboard" />
            <div style={{
                minHeight: '100vh',
                background: '#0d0f1a',
                color: '#fff',
                fontFamily: "'Geist', system-ui, sans-serif",
                padding: '48px',
            }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
                        Company Dashboard
                    </h1>
                    <p style={{ color: '#7880a8' }}>
                        Welcome back, {auth.user.name}!
                        <span style={{
                            marginLeft: '12px',
                            background: 'rgba(240,201,110,.09)',
                            border: '1px solid rgba(240,201,110,.25)',
                            color: '#f0c96e',
                            padding: '2px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                        }}>
                            Company
                        </span>
                    </p>
                </div>

                <p style={{ color: '#7880a8', marginBottom: '24px' }}>
                    Manage your jobs, view candidates, and track outreach — coming soon.
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