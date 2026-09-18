import { Head, Link } from '@inertiajs/react';

export default function Privacy({ entity, grievanceEmail, grievanceOfficer, updatedAt }) {
    return (
        <>
            <Head title="Privacy Policy" />
            <div className="container" style={{ padding: '48px 0 80px', maxWidth: 820 }}>
                <Link href="/" className="link-underline" style={{ fontSize: 14, color: 'var(--text3)' }}>← Back to DevRank</Link>
                <h1 style={{ fontSize: '2.4rem', margin: '18px 0 6px' }}>Privacy Policy</h1>
                <p style={{ color: 'var(--text3)', marginBottom: 32 }}>Last updated: {updatedAt}</p>

                <div className="rich-content" data-reveal="fade" style={{ lineHeight: 1.75, color: 'var(--text2)' }}>
                    <p>
                        {entity} ("we") is the data fiduciary for the personal data you provide. This notice
                        explains what we collect, why, and the rights you have under India's Digital Personal
                        Data Protection Act, 2023 (DPDP).
                    </p>

                    <h2>1. Data we collect</h2>
                    <ul>
                        <li><strong>Account data:</strong> name, email, password (hashed), role.</li>
                        <li><strong>Profile data (candidates):</strong> headline, bio, location, links (GitHub/LinkedIn/website), résumé, experience, skills, job preferences.</li>
                        <li><strong>Company data:</strong> company name, website, industry, description, logo.</li>
                        <li><strong>Activity data:</strong> forum posts, quiz attempts, job applications, interview reviews, outreach messages, and the scores derived from them.</li>
                    </ul>

                    <h2>2. Why we process it (purpose)</h2>
                    <p>
                        To operate the platform: build your public rank, match candidates with companies,
                        run quizzes and the forum, and send service notifications. We process this data on the
                        basis of the consent you give at registration and to provide the service you request.
                    </p>

                    <h2>3. What is public</h2>
                    <p>
                        Your name, headline, rank, skills and public forum activity are visible on your public
                        profile and leaderboard. Your <strong>contact details (email, résumé, GitHub, LinkedIn)
                        stay private</strong> and are shown only to you, to administrators, or to a company whose
                        interest you have accepted (or to a company whose job you applied to).
                    </p>

                    <h2>4. Your rights</h2>
                    <ul>
                        <li><strong>Access &amp; portability:</strong> download all data we hold about you from <Link href="/account/settings" className="link-underline">Account settings</Link>.</li>
                        <li><strong>Correction:</strong> edit your profile at any time.</li>
                        <li><strong>Erasure:</strong> delete your account and personal data from Account settings; authored content is anonymised, not attributed to you.</li>
                        <li><strong>Withdraw consent:</strong> erasing your account withdraws consent to further processing.</li>
                        <li><strong>Grievance redressal:</strong> contact our {grievanceOfficer} at <a href={`mailto:${grievanceEmail}`}>{grievanceEmail}</a>.</li>
                    </ul>

                    <h2>5. Retention &amp; security</h2>
                    <p>
                        We keep your personal data while your account is active and remove it on an erasure
                        request. Passwords are hashed; access to profiles is enforced server-side; the platform
                        applies rate limiting and standard security headers.
                    </p>

                    <h2>6. Contact</h2>
                    <p>
                        Questions or grievances: <a href={`mailto:${grievanceEmail}`}>{grievanceEmail}</a>.
                    </p>
                </div>
            </div>
        </>
    );
}
