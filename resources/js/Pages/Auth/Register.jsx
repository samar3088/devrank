import { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';

export default function Register() {
    const [isLogin, setIsLogin] = useState(false);
    const [role, setRole] = useState('candidate');

    const registerForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'candidate',
        company_name: '',
    });

    const loginForm = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function handleRegister(e) {
        e.preventDefault();
        registerForm.data.role = role;
        registerForm.post('/register');
    }

    function handleLogin(e) {
        e.preventDefault();
        loginForm.post('/login');
    }

    return (
        <>
            <Head title={isLogin ? 'Login' : 'Register'} />

            <div className="auth-wrapper">
                {/* Left Panel - Branding */}
                <div className="auth-left">
                    <div>
                        <div className="auth-logo">
                            <span className="auth-logo-mark">DR</span>
                            <span className="auth-logo-text">Dev<span>Rank</span></span>
                        </div>
                        <h1 className="auth-hero-title">
                            Where <em>Knowledge</em> Builds Careers
                        </h1>
                        <p className="auth-hero-desc">
                            Join thousands of developers getting hired based on what they know, not just what's on their CV.
                        </p>
                    </div>

                    <div className="auth-stats">
                        <div>
                            <div className="auth-stat-value">24,800+</div>
                            <div className="auth-stat-label">Ranked Developers</div>
                        </div>
                        <div>
                            <div className="auth-stat-value">1,340</div>
                            <div className="auth-stat-label">Companies Hiring</div>
                        </div>
                        <div>
                            <div className="auth-stat-value">98%</div>
                            <div className="auth-stat-label">Human-Verified</div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Forms */}
                <div className="auth-right">
                    <div className="auth-form-card">
                        {/* Tab Toggle */}
                        <div className="auth-tabs">
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                            >
                                Register
                            </button>
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`auth-tab ${isLogin ? 'active' : ''}`}
                            >
                                Login
                            </button>
                        </div>

                        {/* Register Form */}
                        {!isLogin && (
                            <div>
                                <div className="auth-role-toggle">
                                    <button
                                        type="button"
                                        onClick={() => setRole('candidate')}
                                        className={`auth-role-btn ${role === 'candidate' ? 'active' : ''}`}
                                    >
                                        👨‍💻 I'm a Candidate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('company')}
                                        className={`auth-role-btn ${role === 'company' ? 'active' : ''}`}
                                    >
                                        🏢 I'm a Company
                                    </button>
                                </div>

                                <form onSubmit={handleRegister}>
                                    <div className="auth-form-group">
                                        <label className="auth-label">Full Name</label>
                                        <input
                                            type="text"
                                            value={registerForm.data.name}
                                            onChange={e => registerForm.setData('name', e.target.value)}
                                            className="auth-input"
                                            placeholder="Enter your full name"
                                        />
                                        {registerForm.errors.name && (
                                            <span className="auth-error">{registerForm.errors.name}</span>
                                        )}
                                    </div>

                                    {role === 'company' && (
                                        <div className="auth-form-group">
                                            <label className="auth-label">Company Name</label>
                                            <input
                                                type="text"
                                                value={registerForm.data.company_name}
                                                onChange={e => registerForm.setData('company_name', e.target.value)}
                                                className="auth-input"
                                                placeholder="Enter company name"
                                            />
                                        </div>
                                    )}

                                    <div className="auth-form-group">
                                        <label className="auth-label">Email Address</label>
                                        <input
                                            type="email"
                                            value={registerForm.data.email}
                                            onChange={e => registerForm.setData('email', e.target.value)}
                                            className="auth-input"
                                            placeholder="you@example.com"
                                        />
                                        {registerForm.errors.email && (
                                            <span className="auth-error">{registerForm.errors.email}</span>
                                        )}
                                    </div>

                                    <div className="auth-form-group">
                                        <label className="auth-label">Password</label>
                                        <input
                                            type="password"
                                            value={registerForm.data.password}
                                            onChange={e => registerForm.setData('password', e.target.value)}
                                            className="auth-input"
                                            placeholder="Min 8 chars, mixed case + number"
                                        />
                                        {registerForm.errors.password && (
                                            <span className="auth-error">{registerForm.errors.password}</span>
                                        )}
                                    </div>

                                    <div className="auth-form-group">
                                        <label className="auth-label">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={registerForm.data.password_confirmation}
                                            onChange={e => registerForm.setData('password_confirmation', e.target.value)}
                                            className="auth-input"
                                            placeholder="Repeat your password"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={registerForm.processing}
                                        className="auth-submit-btn"
                                    >
                                        {registerForm.processing ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Login Form */}
                        {isLogin && (
                            <form onSubmit={handleLogin}>
                                <div className="auth-form-group">
                                    <label className="auth-label">Email Address</label>
                                    <input
                                        type="email"
                                        value={loginForm.data.email}
                                        onChange={e => loginForm.setData('email', e.target.value)}
                                        className="auth-input"
                                        placeholder="you@example.com"
                                    />
                                    {loginForm.errors.email && (
                                        <span className="auth-error">{loginForm.errors.email}</span>
                                    )}
                                </div>

                                <div className="auth-form-group">
                                    <label className="auth-label">Password</label>
                                    <input
                                        type="password"
                                        value={loginForm.data.password}
                                        onChange={e => loginForm.setData('password', e.target.value)}
                                        className="auth-input"
                                        placeholder="Enter your password"
                                    />
                                </div>

                                <div className="auth-remember-row">
                                    <label className="auth-remember-label">
                                        <input
                                            type="checkbox"
                                            checked={loginForm.data.remember}
                                            onChange={e => loginForm.setData('remember', e.target.checked)}
                                        />
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#" className="auth-forgot-link">Forgot password?</a>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loginForm.processing}
                                    className="auth-submit-btn"
                                >
                                    {loginForm.processing ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}