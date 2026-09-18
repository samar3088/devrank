import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import LoadingButton from '@/Components/LoadingButton';

export default function Account({ grievanceEmail }) {
    const [confirming, setConfirming] = useState(false);
    const deleteForm = useForm({ password: '' });

    function submitDelete(e) {
        e.preventDefault();
        deleteForm.delete('/account', {
            preserveScroll: true,
            onError: () => {}, // stay on the form so the password error shows
        });
    }

    return (
        <MainLayout title="Account & Privacy">
            <Head title="Account & Privacy" />
            <div className="container" data-reveal-stagger="80" style={{ paddingTop: 36, paddingBottom: 80, maxWidth: 760 }}>
                <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>Account &amp; Privacy</h1>
                <p style={{ color: 'var(--text3)', marginBottom: 28 }}>
                    Manage your personal data. These controls implement your rights under the DPDP Act.
                </p>

                {/* Export */}
                <div className="dash-card" data-reveal style={{ marginBottom: 20 }}>
                    <div className="dash-card-header">
                        <h4>Download your data</h4>
                    </div>
                    <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                        Export everything DevRank holds about you — profile, forum activity, applications,
                        outreach and quiz history — as a portable JSON file.
                    </p>
                    <a href="/account/data-export" className="btn btn-outline pop-on-active">Export my data (JSON)</a>
                </div>

                {/* Erasure */}
                <div className="dash-card" data-reveal style={{ borderColor: 'rgba(239,68,68,.3)' }}>
                    <div className="dash-card-header">
                        <h4 style={{ color: 'var(--rose, #ef4444)' }}>Delete your account</h4>
                    </div>
                    <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                        Permanently remove your personal data. Your account is deactivated and personal
                        details are erased. Content you authored (forum answers, reviews) is kept but
                        anonymised so it is no longer linked to you. <strong>This cannot be undone.</strong>
                    </p>

                    {!confirming ? (
                        <button type="button" className="btn btn-danger pop-on-active" onClick={() => setConfirming(true)}>
                            Delete my account
                        </button>
                    ) : (
                        <form onSubmit={submitDelete} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
                            <label style={{ fontSize: 13, color: 'var(--text3)' }}>
                                Confirm your password to proceed
                                <input
                                    type="password"
                                    className="form-input"
                                    autoFocus
                                    value={deleteForm.data.password}
                                    onChange={(e) => deleteForm.setData('password', e.target.value)}
                                    style={{ marginTop: 6 }}
                                />
                            </label>
                            {deleteForm.errors.password && (
                                <span className="auth-error">{deleteForm.errors.password}</span>
                            )}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <LoadingButton type="submit" loading={deleteForm.processing} className="btn btn-danger">
                                    {deleteForm.processing ? 'Deleting…' : 'Permanently delete'}
                                </LoadingButton>
                                <button type="button" className="btn btn-ghost" onClick={() => { setConfirming(false); deleteForm.reset(); deleteForm.clearErrors(); }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <p style={{ color: 'var(--text4)', fontSize: 13, marginTop: 24 }}>
                    Privacy questions? Contact <a href={`mailto:${grievanceEmail}`} className="link-underline">{grievanceEmail}</a>.
                    See our <a href="/privacy" className="link-underline">Privacy Policy</a>.
                </p>
            </div>
        </MainLayout>
    );
}
