import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

export default function About({ entity }) {
    return (
        <MainLayout>
            <Head title="About Us" />
            <div className="container" style={{ padding: '48px 0 80px', maxWidth: 820 }}>
                <Link href="/" className="link-underline" style={{ fontSize: 14, color: 'var(--text3)' }}>← Back to DevRank</Link>
                <h1 style={{ fontSize: '2.4rem', margin: '18px 0 6px' }}>About {entity}</h1>
                <p style={{ color: 'var(--text3)', marginBottom: 32 }}>Your knowledge is your resume.</p>

                <div className="rich-content" data-reveal="fade" style={{ lineHeight: 1.75, color: 'var(--text2)' }}>
                    <p>
                        DevRank is a merit-based developer ranking and hiring platform. We believe a
                        developer's real ability should speak louder than a polished CV — so we let
                        engineers build a public, verifiable track record and help companies hire
                        on evidence, not guesswork.
                    </p>

                    <h2>What we do</h2>
                    <ul>
                        <li><strong>For developers:</strong> earn a transparent rank through forum answers, skill quizzes and verified contributions — then get discovered by companies without spraying résumés into the void.</li>
                        <li><strong>For companies:</strong> find talent by demonstrated skill, reach out directly, and build a public trust score through fair, responsive hiring.</li>
                    </ul>

                    <h2>What we stand for</h2>
                    <ul>
                        <li><strong>Merit over marketing:</strong> rank is earned by activity, never bought.</li>
                        <li><strong>Zero ghosting:</strong> companies must respond to candidates and give real reasons — conduct is measured.</li>
                        <li><strong>Fairness &amp; privacy:</strong> optional anonymous mode reduces bias, and your personal data stays yours (see our <Link href="/privacy" className="link-underline">Privacy Policy</Link>).</li>
                        <li><strong>Transparency:</strong> verified hires and consented, aggregate-only salary data help everyone negotiate from facts.</li>
                    </ul>

                    <h2>Get in touch</h2>
                    <p>
                        Want to partner, hire, or just say hello? Reach us via the contact details on
                        our <Link href="/privacy" className="link-underline">Privacy</Link> page. We'd love to hear from you.
                    </p>
                </div>
            </div>
            <FullFooter />
        </MainLayout>
    );
}
