import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

export default function Terms({ entity, updatedAt }) {
    return (
        <MainLayout>
            <Head title="Terms of Service" />
            <div className="container" style={{ padding: '48px 0 80px', maxWidth: 820 }}>
                <Link href="/" className="link-underline" style={{ fontSize: 14, color: 'var(--text3)' }}>← Back to DevRank</Link>
                <h1 style={{ fontSize: '2.4rem', margin: '18px 0 6px' }}>Terms of Service</h1>
                <p style={{ color: 'var(--text3)', marginBottom: 32 }}>Last updated: {updatedAt}</p>

                <div className="rich-content" data-reveal="fade" style={{ lineHeight: 1.75, color: 'var(--text2)' }}>
                    <p>By creating an account on {entity} (DevRank) you agree to these terms.</p>

                    <h2>1. Your account</h2>
                    <p>You are responsible for the accuracy of the information you provide and for keeping your credentials secure. One person or organisation per account. You must be legally able to enter into this agreement.</p>

                    <h2>2. Acceptable use</h2>
                    <ul>
                        <li>No submitting AI-generated work as your own — the platform verifies human authorship, and gaming your rank is grounds for suspension.</li>
                        <li>No harassment, spam, scraping, or misleading job postings.</li>
                        <li>Only connect accounts you own (e.g. your own GitHub) and post reviews of interviews you genuinely attended.</li>
                        <li>Companies must give a genuine reason when rejecting a candidate and respond to applications within the stated SLA; conduct affects your trust score.</li>
                    </ul>

                    <h2>3. Content you post</h2>
                    <p>You retain ownership of what you post, and grant {entity} a licence to display it on the platform (e.g. forum answers, interview reviews). We may moderate or remove content that violates these terms. Content reported by enough distinct users may be auto-hidden pending review.</p>

                    <h2>4. Ranks, scores &amp; verified hires</h2>
                    <p>Ranks, human scores and trust scores are computed from your activity and provided as-is; we may refine the methodology to preserve fairness. A "verified hire" requires confirmation from both the company and the candidate — neither side may record a hire that did not happen. Sharing your compensation for salary transparency is voluntary and aggregate-only.</p>

                    <h2>5. Service availability</h2>
                    <p>The platform is provided "as is" without warranties. Optional features that depend on third-party services (such as code execution or AI checks) may be enabled or disabled at our discretion.</p>

                    <h2>6. Termination</h2>
                    <p>You may delete your account at any time from <Link href="/account/settings" className="link-underline">Account settings</Link>. We may suspend or terminate accounts that violate these terms.</p>

                    <h2>7. Changes</h2>
                    <p>We may update these terms; continued use after an update constitutes acceptance. See our <Link href="/privacy" className="link-underline">Privacy Policy</Link> for how we handle your data.</p>
                </div>
            </div>
            <FullFooter />
        </MainLayout>
    );
}
