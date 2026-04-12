import '../../../css/pages/verify-email.css';
import LoadingButton from '@/Components/LoadingButton';
import { Head, useForm, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function VerifyEmail() {
    const { status } = usePage().props;
    const { auth } = usePage().props;
    const form = useForm({});

    function handleResend(e) {
        e.preventDefault();
        form.post('/email/verification-notification');
    }

    return (
        <MainLayout>
            <Head title="Verify Email" />
            <div className="verify-wrapper">
                <div className="verify-card">
                    <div className="verify-icon">📧</div>

                    <h2>Check Your Email</h2>

                    <p className="verify-desc">
                        We've sent a verification link to <strong>{auth.user.email}</strong>.
                        Click the link in the email to activate your account.
                    </p>

                    {status === 'verification-link-sent' && (
                        <div className="verify-success">
                            ✓ A new verification link has been sent to your email!
                        </div>
                    )}

                    <div className="verify-steps">
                        <div className="verify-step">
                            <span className="verify-step-num">1</span>
                            <span>Open your email inbox</span>
                        </div>
                        <div className="verify-step">
                            <span className="verify-step-num">2</span>
                            <span>Find the email from DevRank</span>
                        </div>
                        <div className="verify-step">
                            <span className="verify-step-num">3</span>
                            <span>Click the verification link</span>
                        </div>
                    </div>

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

                    <div className="verify-alert">
                        <span>💡</span>
                        <span>The verification link expires in 60 minutes. After that, you'll need to request a new one.</span>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}