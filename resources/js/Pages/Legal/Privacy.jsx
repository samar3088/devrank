import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

export default function Privacy({ entity, grievanceEmail, grievanceOfficer, updatedAt }) {
    return (
        <MainLayout>
            <Head title="Privacy Policy" />
            <div className="container" style={{ padding: '48px 0 80px', maxWidth: 820 }}>
                <Link href="/" className="link-underline" style={{ fontSize: 14, color: 'var(--text3)' }}>← Back to DevRank</Link>
                <h1 style={{ fontSize: '2.4rem', margin: '18px 0 6px' }}>Privacy Policy</h1>
                <p style={{ color: 'var(--text3)', marginBottom: 32 }}>Last updated: {updatedAt}</p>

                <div className="rich-content" data-reveal="fade" style={{ lineHeight: 1.75, color: 'var(--text2)' }}>
                    <p>
                        {entity} ("we", "us") is the data fiduciary for the personal data you provide on DevRank.
                        This notice explains what we collect, why, who can see it, and the rights you have under
                        India's Digital Personal Data Protection Act, 2023 (DPDP). We process your data on the
                        basis of the consent you give at registration and to provide the service you request.
                    </p>

                    <h2>1. Data we collect</h2>
                    <ul>
                        <li><strong>Account data:</strong> name, email, phone (optional), password (stored hashed), role.</li>
                        <li><strong>Candidate profile:</strong> headline, bio, location, links (GitHub/LinkedIn/website), résumé, experience level, skills and job preferences (including any salary expectation you enter).</li>
                        <li><strong>Company profile:</strong> company name, website, size, industry, description, logo.</li>
                        <li><strong>Activity data:</strong> forum posts, quiz attempts, job applications, interview reviews, outreach and the rank / human / trust scores derived from them.</li>
                        <li><strong>Connected accounts (optional):</strong> if you connect GitHub, we import only public data (public repo count, stars, followers, top language) as a verified rank signal.</li>
                        <li><strong>Hiring outcomes (optional):</strong> if a hire is recorded and you confirm it, we store the role and, where provided, the offer figure.</li>
                        <li><strong>Technical data:</strong> an essential session cookie and CSRF token to keep you signed in and secure; limited access logs.</li>
                    </ul>

                    <h2>2. Why we process it (purpose)</h2>
                    <p>
                        To operate the platform: build your public rank, match candidates with companies, run
                        quizzes and the forum, record verified hires, and send service notifications. We do not
                        sell your personal data.
                    </p>

                    <h2>3. What is public, and what stays private</h2>
                    <p>
                        Your name, headline, rank, skills and public forum activity appear on your public profile
                        and the leaderboard. Your <strong>contact details (email, résumé, GitHub, LinkedIn) stay
                        private</strong> and are shown only to you, to administrators, or to a company whose
                        interest you have accepted (or whose job you applied to). If you enable
                        <strong> anonymous mode</strong>, your name, photo and location are masked in discovery
                        until you accept a company's interest — your rank and skills remain visible so you are
                        evaluated on merit.
                    </p>

                    <h2>4. Salary transparency</h2>
                    <p>
                        Compensation from a verified hire is included in our public salary pages
                        <strong> only if you explicitly opt in</strong>, and even then it is shown solely as part
                        of an <strong>aggregate</strong> (medians and ranges over a minimum number of people) —
                        never as an individual figure that could identify you. You can decline sharing at
                        confirmation time.
                    </p>

                    <h2>5. Your rights</h2>
                    <ul>
                        <li><strong>Access &amp; portability:</strong> download everything we hold about you from <Link href="/account/settings" className="link-underline">Account settings</Link>.</li>
                        <li><strong>Correction:</strong> edit your profile at any time.</li>
                        <li><strong>Erasure:</strong> delete your account and personal data from Account settings; authored content is anonymised, not attributed to you, and any shared salary figure is removed from the aggregates.</li>
                        <li><strong>Withdraw consent:</strong> erasing your account withdraws consent to further processing.</li>
                        <li><strong>Grievance redressal:</strong> contact our {grievanceOfficer} at <a href={`mailto:${grievanceEmail}`}>{grievanceEmail}</a>.</li>
                    </ul>

                    <h2>6. Retention &amp; security</h2>
                    <p>
                        We keep your personal data while your account is active and remove it on an erasure
                        request. Passwords are hashed; access to private data is enforced server-side; the platform
                        applies rate limiting, CSRF protection, server-side input sanitisation and standard
                        security headers over HTTPS.
                    </p>

                    <h2>7. Contact</h2>
                    <p>
                        Questions or grievances: <a href={`mailto:${grievanceEmail}`}>{grievanceEmail}</a>. We may
                        update this notice; the "last updated" date above reflects the current version.
                    </p>
                </div>
            </div>
            <FullFooter />
        </MainLayout>
    );
}
