import { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import LoadingButton from '@/Components/LoadingButton';

/**
 * Drop this into Pages/PublicProfile/CandidateProfile.jsx
 *
 * Usage:
 *   <SendInterestButton candidateId={candidate.id} existingStatus={interestStatus} />
 *
 * Props:
 *   candidateId    - the candidate's user id
 *   existingStatus - null | 'pending' | 'accepted' | 'declined'  (from PublicProfileController)
 */
export default function SendInterestButton({ candidateId, existingStatus }) {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
    });

    // Only company role sees this
    if (!auth?.user || auth.user.role !== 'company') return null;

    function submit(e) {
        e.preventDefault();
        post(`/interests/send/${candidateId}`, {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
            preserveScroll: true,
        });
    }

    // Already sent — show status pill
    if (existingStatus) {
        return (
            <span className={`interest-status ${existingStatus}`} style={{ padding: '8px 16px', fontSize: 13 }}>
                {{
                    pending:  '⏳ Interest Sent',
                    accepted: '✅ Connected',
                    declined: '✗ Declined',
                }[existingStatus]}
            </span>
        );
    }

    return (
        <>
            <button
                className="btn btn-primary"
                onClick={() => setOpen(true)}
            >
                Send Interest
            </button>

            {open && (
                <div className="interest-modal-overlay" onClick={() => setOpen(false)}>
                    <div className="interest-modal" onClick={e => e.stopPropagation()}>
                        <h3>Send Interest Request</h3>
                        <p className="modal-sub">
                            Introduce yourself and explain why you're interested. The candidate will review
                            your company profile before accepting.
                        </p>

                        <form onSubmit={submit}>
                            <div className="form-group">
                                <label className="form-label">Your Message *</label>
                                <textarea
                                    className={`form-input ${errors.message ? 'is-error' : ''}`}
                                    rows={5}
                                    maxLength={500}
                                    placeholder="Hi! We came across your profile on DevRank and were impressed by your contributions in..."
                                    value={data.message}
                                    onChange={e => setData('message', e.target.value)}
                                />
                                <div className="char-count">{data.message.length} / 500</div>
                                {errors.message && (
                                    <div className="form-error">{errors.message}</div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                <LoadingButton
                                    type="submit"
                                    className="btn btn-primary"
                                    loading={processing}
                                >
                                    Send Request
                                </LoadingButton>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
