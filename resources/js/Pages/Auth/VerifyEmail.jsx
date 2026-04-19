import { Head, useForm, usePage, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import LoadingButton from '@/Components/LoadingButton';

export default function VerifyEmail() {
    const { status, auth } = usePage().props;
    const form = useForm({});

    function handleResend(e) {
        e.preventDefault();
        form.post('/email/verification-notification', {
            onFinish: () => {},
        });
    }

    return (
        <MainLayout>
            <Head title="Verify Email" />
            <div className="verify-wrapper">
                {status === 'verification-link-sent' ? (
                    /* State: Link Sent Confirmation */
                    <div className="verify-card">
                        <div className="verify-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--violet-bright)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                            </svg>
                        </div>
                        <h2>Check Your Email</h2>
                        <div className="verify-success-msg">
                            ✓ A new verification link has been sent to your email!
                        </div>
                        <p className="verify-desc">
                            We've sent a verification link to <strong>{auth.user.email}</strong>.
                            Click the link in the email to activate your account.
                        </p>
                        <div className="verify-steps">
                            <div className="verify-step">
                                <span className="step-num">1</span>
                                <span>Open your email inbox</span>
                            </div>
                            <div className="verify-step">
                                <span className="step-num">2</span>
                                <span>Find the email from DevRank</span>
                            </div>
                            <div className="verify-step">
                                <span className="step-num">3</span>
                                <span>Click the verification link</span>
                            </div>
                        </div>
                        <div className="verify-actions">
                            <form onSubmit={handleResend}>
                                <LoadingButton
                                    type="submit"
                                    loading={form.processing}
                                    className="verify-resend-btn"
                                >
                                    {form.processing ? 'Sending...' : 'Resend Verification Email'}
                                </LoadingButton>
                            </form>
                            <p className="verify-hint">
                                Didn't receive the email? Check your spam folder or try resending.
                            </p>
                        </div>
                        <div className="verify-alert">
                            <span>💡</span>
                            <span>The verification link expires in 60 minutes. After that, you'll need to request a new one.</span>
                        </div>
                    </div>
                ) : status === 'already-verified' ? (
                    /* State: Already Verified */
                    <div className="verify-card">
                        <div className="verify-icon success">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <h2>Email Verified!</h2>
                        <p className="verify-desc">
                            Your account has been verified successfully. You're all set to start using DevRank.
                        </p>
                        <Link href="/dashboard" className="verify-continue-btn">Continue to Dashboard</Link>
                    </div>
                ) : (
                    /* State: Pending (default) */
                    <div className="verify-card">
                        <div className="verify-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--violet-bright)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                            </svg>
                        </div>
                        <h2>Check Your Email</h2>
                        <p className="verify-desc">
                            We've sent a verification link to <strong>{auth.user.email}</strong>.
                            Click the link in the email to activate your account.
                        </p>
                        <div className="verify-steps">
                            <div className="verify-step">
                                <span className="step-num">1</span>
                                <span>Open your email inbox</span>
                            </div>
                            <div className="verify-step">
                                <span className="step-num">2</span>
                                <span>Find the email from DevRank</span>
                            </div>
                            <div className="verify-step">
                                <span className="step-num">3</span>
                                <span>Click the verification link</span>
                            </div>
                        </div>
                        <div className="verify-actions">
                            <form onSubmit={handleResend}>
                                <LoadingButton
                                    type="submit"
                                    loading={form.processing}
                                    className="verify-resend-btn"
                                >
                                    {form.processing ? 'Sending...' : 'Resend Verification Email'}
                                </LoadingButton>
                            </form>
                            <p className="verify-hint">
                                Didn't receive the email? Check your spam folder or try resending.
                            </p>
                        </div>
                        <div className="verify-alert">
                            <span>💡</span>
                            <span>The verification link expires in 60 minutes. After that, you'll need to request a new one.</span>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
