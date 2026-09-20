import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

export default function Cookies({ entity, grievanceEmail, updatedAt }) {
    return (
        <MainLayout>
            <Head title="Cookie Policy" />
            <div className="container" style={{ padding: '48px 0 80px', maxWidth: 820 }}>
                <Link href="/" className="link-underline" style={{ fontSize: 14, color: 'var(--text3)' }}>← Back to DevRank</Link>
                <h1 style={{ fontSize: '2.4rem', margin: '18px 0 6px' }}>Cookie Policy</h1>
                <p style={{ color: 'var(--text3)', marginBottom: 32 }}>Last updated: {updatedAt}</p>

                <div className="rich-content" data-reveal="fade" style={{ lineHeight: 1.75, color: 'var(--text2)' }}>
                    <p>
                        This policy explains how {entity} (DevRank) uses cookies and similar
                        technologies. We keep this deliberately minimal — DevRank uses only what it
                        needs to run securely, and does not use third-party advertising or
                        cross-site tracking cookies.
                    </p>

                    <h2>1. What cookies are</h2>
                    <p>
                        Cookies are small text files a website stores in your browser. Some are
                        essential for the site to function; others help remember preferences.
                    </p>

                    <h2>2. Cookies we use</h2>
                    <ul>
                        <li><strong>Session cookie (essential):</strong> keeps you signed in and maintains your session. The site cannot work without it.</li>
                        <li><strong>CSRF / XSRF token (essential):</strong> a security token that protects forms and actions against cross-site request forgery.</li>
                        <li><strong>Preference (optional):</strong> remembers small UI choices, such as a light/dark theme, on your device only.</li>
                    </ul>
                    <p>We do <strong>not</strong> use advertising, marketing, or third-party analytics tracking cookies.</p>

                    <h2>3. Managing cookies</h2>
                    <p>
                        You can clear or block cookies in your browser settings. Note that blocking
                        the essential session/CSRF cookies will prevent you from signing in or
                        submitting forms.
                    </p>

                    <h2>4. Changes &amp; contact</h2>
                    <p>
                        We may update this policy; the date above reflects the current version. See our{' '}
                        <Link href="/privacy" className="link-underline">Privacy Policy</Link> for how we handle
                        personal data. Questions: <a href={`mailto:${grievanceEmail}`}>{grievanceEmail}</a>.
                    </p>
                </div>
            </div>
            <FullFooter />
        </MainLayout>
    );
}
