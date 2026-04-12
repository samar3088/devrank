import '@css/pages/auth.css';
import { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';

export default function Register() {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('candidate');

    const registerForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'candidate',
        company_name: '',
        company_website: '',
        industry: '',
        primary_skill: '',
        years_of_experience: '',
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

    function switchTab(mode) {
        setIsLogin(mode === 'login');
    }

    return (
        <>
            <Head title={isLogin ? 'Login' : 'Register'} />

            <div className="auth-split">
                {/* ── Left Panel ──────────────────────────────── */}
                <div className="auth-left">
                    <a href="/" className="auth-logo" style={{ textDecoration: 'none' }}>
                        <span className="auth-logo-mark">DR</span>
                        <span className="auth-logo-text">Dev<span>Rank</span></span>
                    </a>

                    <div className="auth-left-content auth-pitch">
                        <h2>The Platform Where Knowledge Gets You Hired</h2>
                        <p>Stop submitting resumes into the void. Build a verified rank. Get found by companies that value what you actually know.</p>

                        <div className="auth-feature">
                            <div className="auth-feature-icon">📊</div>
                            <div>
                                <div className="auth-feature-title">5-Pillar Verified Rank</div>
                                <div className="auth-feature-desc">Forum answers, quizzes, interviews, certifications, and demand signals — all verified, none self-reported.</div>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🤖</div>
                            <div>
                                <div className="auth-feature-title">AI Detection Built In</div>
                                <div className="auth-feature-desc">Every answer is verified human. Your rank means something because we ensure it can't be gamed.</div>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🚫</div>
                            <div>
                                <div className="auth-feature-title">Zero Ghosting Policy</div>
                                <div className="auth-feature-desc">Companies must give a reason for every rejection. You always know where you stand.</div>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🎯</div>
                            <div>
                                <div className="auth-feature-title">Direct Company Outreach</div>
                                <div className="auth-feature-desc">Top-ranked candidates receive outreach from companies — without applying first.</div>
                            </div>
                        </div>

                        <div className="auth-stat-row">
                            <div>
                                <div className="auth-stat-val">24K+</div>
                                <div className="auth-stat-lbl">Developers</div>
                            </div>
                            <div>
                                <div className="auth-stat-val">1,340</div>
                                <div className="auth-stat-lbl">Companies</div>
                            </div>
                            <div>
                                <div className="auth-stat-val">98%</div>
                                <div className="auth-stat-lbl">Human Score</div>
                            </div>
                        </div>
                    </div>

                    <div className="auth-copyright">© 2026 DevRank. All rights reserved.</div>
                </div>

                {/* ── Right Panel ─────────────────────────────── */}
                <div className="auth-right">
                    <div className="auth-form-box">
                        <div className="auth-form-header">
                            <h3>Welcome to DevRank</h3>
                            <p>Join as a candidate or hire as a company.</p>
                        </div>

                        {/* Auth Mode Tabs */}
                        <div className="auth-tabs">
                            <button
                                className={`auth-tab ${isLogin ? 'active' : ''}`}
                                onClick={() => switchTab('login')}
                            >
                                Log In
                            </button>
                            <button
                                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                                onClick={() => switchTab('register')}
                            >
                                Register
                            </button>
                        </div>

                        {/* ── LOGIN FORM ──────────────────────── */}
                        {isLogin && (
                            <form onSubmit={handleLogin}>
                                <div className="auth-form-group">
                                    <label className="auth-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="auth-input"
                                        placeholder="you@example.com"
                                        value={loginForm.data.email}
                                        onChange={e => loginForm.setData('email', e.target.value)}
                                    />
                                    {loginForm.errors.email && (
                                        <span className="auth-error">{loginForm.errors.email}</span>
                                    )}
                                </div>

                                <div className="auth-form-group">
                                    <label className="auth-label">Password</label>
                                    <input
                                        type="password"
                                        className="auth-input"
                                        placeholder="Your password"
                                        value={loginForm.data.password}
                                        onChange={e => loginForm.setData('password', e.target.value)}
                                    />
                                    <div className="auth-hint">
                                        <Link href="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="auth-submit-btn"
                                    disabled={loginForm.processing}
                                >
                                    {loginForm.processing ? 'Signing In...' : 'Log In to DevRank'}
                                </button>
                            </form>
                        )}

                        {/* ── REGISTER FORM ──────────────────── */}
                        {!isLogin && (
                            <form onSubmit={handleRegister}>
                                {/* Role Toggle */}
                                <div className="role-toggle">
                                    <button
                                        type="button"
                                        className={`role-btn ${role === 'candidate' ? 'active' : ''}`}
                                        onClick={() => setRole('candidate')}
                                    >
                                        👤 Candidate
                                    </button>
                                    <button
                                        type="button"
                                        className={`role-btn ${role === 'company' ? 'active' : ''}`}
                                        onClick={() => setRole('company')}
                                    >
                                        🏢 Company
                                    </button>
                                </div>

                                {/* Common Fields */}
                                <div className="auth-form-group">
                                    <label className="auth-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="auth-input"
                                        placeholder="Arjun Kumar"
                                        value={registerForm.data.name}
                                        onChange={e => registerForm.setData('name', e.target.value)}
                                    />
                                    {registerForm.errors.name && (
                                        <span className="auth-error">{registerForm.errors.name}</span>
                                    )}
                                </div>

                                <div className="auth-form-group">
                                    <label className="auth-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="auth-input"
                                        placeholder="you@example.com"
                                        value={registerForm.data.email}
                                        onChange={e => registerForm.setData('email', e.target.value)}
                                    />
                                    {registerForm.errors.email && (
                                        <span className="auth-error">{registerForm.errors.email}</span>
                                    )}
                                </div>

                                <div className="auth-form-group">
                                    <label className="auth-label">Password</label>
                                    <input
                                        type="password"
                                        className="auth-input"
                                        placeholder="Min 8 characters"
                                        value={registerForm.data.password}
                                        onChange={e => registerForm.setData('password', e.target.value)}
                                    />
                                    {registerForm.errors.password && (
                                        <span className="auth-error">{registerForm.errors.password}</span>
                                    )}
                                </div>

                                <div className="auth-form-group">
                                    <label className="auth-label">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="auth-input"
                                        placeholder="Repeat your password"
                                        value={registerForm.data.password_confirmation}
                                        onChange={e => registerForm.setData('password_confirmation', e.target.value)}
                                    />
                                </div>

                                {/* Candidate Fields */}
                                {role === 'candidate' && (
                                    <>
                                        <div className="auth-form-group">
                                            <label className="auth-label">Primary Skill / Tag</label>
                                            <select
                                                className="auth-select"
                                                value={registerForm.data.primary_skill}
                                                onChange={e => registerForm.setData('primary_skill', e.target.value)}
                                            >
                                                <option value="">Select your strongest skill</option>
                                                <option>React</option>
                                                <option>Node.js</option>
                                                <option>Laravel / PHP</option>
                                                <option>Python</option>
                                                <option>System Design</option>
                                                <option>AWS / DevOps</option>
                                                <option>SQL / Databases</option>
                                                <option>TypeScript</option>
                                            </select>
                                        </div>
                                        <div className="auth-form-group">
                                            <label className="auth-label">Years of Experience</label>
                                            <select
                                                className="auth-select"
                                                value={registerForm.data.years_of_experience}
                                                onChange={e => registerForm.setData('years_of_experience', e.target.value)}
                                            >
                                                <option value="">Select experience</option>
                                                <option>0–1 years (Fresher)</option>
                                                <option>1–3 years</option>
                                                <option>3–5 years</option>
                                                <option>5–8 years</option>
                                                <option>8+ years</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {/* Company Fields */}
                                {role === 'company' && (
                                    <>
                                        <div className="auth-form-group">
                                            <label className="auth-label">Company Name</label>
                                            <input
                                                type="text"
                                                className="auth-input"
                                                placeholder="Your Company Pvt. Ltd."
                                                value={registerForm.data.company_name}
                                                onChange={e => registerForm.setData('company_name', e.target.value)}
                                            />
                                        </div>
                                        <div className="auth-form-group">
                                            <label className="auth-label">Company Website</label>
                                            <input
                                                type="url"
                                                className="auth-input"
                                                placeholder="https://yourcompany.com"
                                                value={registerForm.data.company_website}
                                                onChange={e => registerForm.setData('company_website', e.target.value)}
                                            />
                                        </div>
                                        <div className="auth-form-group">
                                            <label className="auth-label">Industry</label>
                                            <select
                                                className="auth-select"
                                                value={registerForm.data.industry}
                                                onChange={e => registerForm.setData('industry', e.target.value)}
                                            >
                                                <option value="">Select industry</option>
                                                <option>IT Services & Consulting</option>
                                                <option>Product / SaaS</option>
                                                <option>Fintech</option>
                                                <option>E-commerce</option>
                                                <option>Healthcare Tech</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div className="auth-alert">
                                            <span>📧</span>
                                            <span>Company accounts require email verification before posting jobs.</span>
                                        </div>
                                    </>
                                )}

                                <label className="auth-terms">
                                    <input type="checkbox" required />
                                    <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
                                </label>

                                <button
                                    type="submit"
                                    className="auth-submit-btn"
                                    disabled={registerForm.processing}
                                >
                                    {registerForm.processing ? 'Creating Account...' : 'Create My Account'}
                                </button>
                            </form>
                        )}

                        <div className="auth-divider">or continue with</div>

                        <button className="auth-google-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </button>

                        <div className="auth-footer-text">
                            {isLogin ? (
                                <span>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); switchTab('register'); }}>Register free</a></span>
                            ) : (
                                <span>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); switchTab('login'); }}>Log in</a></span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}