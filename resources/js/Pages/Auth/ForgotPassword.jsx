import LoadingButton from '@/Components/LoadingButton';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const form = useForm({
        email: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.post('/forgot-password', {
            onSuccess: () => form.reset(),
        });
    }

    return (
        <>
            <Head title="Forgot Password" />

            <div className="password-wrapper">
                <div className="password-card">
                    <div className="password-header">
                        <Link href="/" className="password-logo">
                            <span className="password-logo-mark">DR</span>
                            <span className="password-logo-text">Dev<span>Rank</span></span>
                        </Link>
                        <div className="password-icon">🔑</div>
                        <h2>Forgot Your Password?</h2>
                        <p>No worries. Enter your email and we'll send you a reset link.</p>
                    </div>

                    {status && (
                        <div className="password-success">✓ {status}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="password-form-group">
                            <label className="password-label">Email Address</label>
                            <input
                                type="email"
                                className="password-input"
                                placeholder="you@example.com"
                                value={form.data.email}
                                onChange={e => form.setData('email', e.target.value)}
                            />
                            {form.errors.email && (
                                <span className="password-error">{form.errors.email}</span>
                            )}
                        </div>

                        <LoadingButton
                            type="submit"
                            loading={form.processing}
                            className="password-submit-btn"
                        >
                            {form.processing ? 'Sending...' : 'Send Reset Link'}
                        </LoadingButton>
                    </form>

                    <div className="password-back-link">
                        <Link href="/account">← Back to Login</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
