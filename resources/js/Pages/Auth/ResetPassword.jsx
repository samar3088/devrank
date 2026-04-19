import { Head, useForm, Link } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const form = useForm({
        token: token,
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.post('/reset-password');
    }

    return (
        <>
            <Head title="Reset Password" />

            <div className="password-wrapper">
                <div className="password-card">
                    <div className="password-header">
                        <Link href="/" className="password-logo">
                            <span className="password-logo-mark">DR</span>
                            <span className="password-logo-text">Dev<span>Rank</span></span>
                        </Link>
                        <div className="password-icon">🔒</div>
                        <h2>Reset Your Password</h2>
                        <p>Choose a new strong password for your account.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="password-form-group">
                            <label className="password-label">Email Address</label>
                            <input
                                type="email"
                                className="password-input"
                                value={form.data.email}
                                onChange={e => form.setData('email', e.target.value)}
                            />
                            {form.errors.email && (
                                <span className="password-error">{form.errors.email}</span>
                            )}
                        </div>

                        <div className="password-form-group">
                            <label className="password-label">New Password</label>
                            <input
                                type="password"
                                className="password-input"
                                placeholder="Min 8 chars, mixed case + number"
                                value={form.data.password}
                                onChange={e => form.setData('password', e.target.value)}
                            />
                            {form.errors.password && (
                                <span className="password-error">{form.errors.password}</span>
                            )}
                        </div>

                        <div className="password-form-group">
                            <label className="password-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="password-input"
                                placeholder="Repeat your new password"
                                value={form.data.password_confirmation}
                                onChange={e => form.setData('password_confirmation', e.target.value)}
                            />
                        </div>

                        <LoadingButton
                            type="submit"
                            loading={form.processing}
                            className="password-submit-btn"
                        >
                            {form.processing ? 'Resetting...' : 'Reset Password'}
                        </LoadingButton>
                    </form>
                </div>
            </div>
        </>
    );
}
