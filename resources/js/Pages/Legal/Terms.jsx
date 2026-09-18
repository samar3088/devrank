import { Head, Link } from '@inertiajs/react';

export default function Terms({ entity, updatedAt }) {
    return (
        <>
            <Head title="Terms of Service" />
            <div className="container" style={{ padding: '48px 0 80px', maxWidth: 820 }}>
                <Link href="/" className="link-underline" style={{ fontSize: 14, color: 'var(--text3)' }}>← Back to DevRank</Link>
                <h1 style={{ fontSize: '2.4rem', margin: '18px 0 6px' }}>Terms of Service</h1>
                <p style={{ color: 'var(--text3)', marginBottom: 32 }}>Last updated: {updatedAt}</p>

                <div className="rich-content" data-reveal="fade" style={{ lineHeight: 1.75, color: 'var(--text2)' }}>
                    <p>By creating an account on {entity} you agree to these terms.</p>

                    <h2>1. Your account</h2>
                    <p>You are responsible for the accuracy of the information you provide and for keeping your credentials secure. One person or organisation per account.</p>

                    <h2>2. Acceptable use</h2>
                    <ul>
                        <li>No submitting AI-generated work as your own — the platform verifies human authorship, and gaming rank is grounds for suspension.</li>
                        <li>No harassment, spam, or misleading job postings.</li>
                        <li>Companies must provide a genuine reason when rejecting a candidate and respond to applications within the stated SLA; conduct affects your trust score.</li>
                    </ul>

                    <h2>3. Content</h2>
                    <p>You retain ownership of what you post, and grant {entity} a licence to display it on the platform (e.g. forum answers, interview reviews). We may moderate or remove content that violates these terms.</p>

                    <h2>4. Ranks &amp; scores</h2>
                    <p>Ranks, human scores and trust scores are computed from your activity and are provided as-is. We may adjust the scoring methodology to preserve fairness.</p>

                    <h2>5. Termination</h2>
                    <p>You may delete your account at any time from <Link href="/account/settings" className="link-underline">Account settings</Link>. We may suspend accounts that violate these terms.</p>

                    <h2>6. Changes</h2>
                    <p>We may update these terms; continued use after an update constitutes acceptance.</p>
                </div>
            </div>
        </>
    );
}
