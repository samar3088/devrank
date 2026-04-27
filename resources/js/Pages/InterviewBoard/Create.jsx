import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import LoadingButton from '@/Components/LoadingButton';

const ROUND_TYPES = ['Technical', 'HR', 'System Design', 'Coding Test', 'Case Study', 'Culture Fit', 'Manager Round', 'Group Discussion', 'Assignment'];

const EMPTY_ROUND = { type: 'Technical', difficulty: 'medium', description: '' };

export default function InterviewBoardCreate() {
    const form = useForm({
        company_name:      '',
        role_applied:      '',
        interview_date:    '',
        rounds_detail:     [{ ...EMPTY_ROUND }],
        outcome:           'pending',
        difficulty_rating: 3,
        experience_rating: 3,
        tips:              '',
    });

    function addRound() {
        if (form.data.rounds_detail.length >= 8) return;
        form.setData('rounds_detail', [...form.data.rounds_detail, { ...EMPTY_ROUND }]);
    }

    function removeRound(index) {
        if (form.data.rounds_detail.length <= 1) return;
        form.setData('rounds_detail', form.data.rounds_detail.filter((_, i) => i !== index));
    }

    function updateRound(index, field, value) {
        const rounds = [...form.data.rounds_detail];
        rounds[index] = { ...rounds[index], [field]: value };
        form.setData('rounds_detail', rounds);
    }

    function submit(e) {
        e.preventDefault();
        form.post('/interviews', {
            onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        });
    }

    return (
        <MainLayout>
            <Head title="Share Interview Experience — DevRank" />
            <div className="container" style={{ paddingTop: 36, paddingBottom: 80, maxWidth: 720 }}>

                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 10 }}>
                        <Link href="/interviews" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Interview Board</Link>
                        {' '} › Share Experience
                    </div>
                    <h1 style={{ marginBottom: 6 }}>Share Your Interview Experience</h1>
                    <p style={{ color: 'var(--text3)', fontSize: 14 }}>
                        Help other developers know what to expect. Your experience is anonymous to companies.
                    </p>
                </div>

                {Object.keys(form.errors).length > 0 && (
                    <div style={{ background: 'var(--coral-soft)', border: '1px solid var(--coral-border)', borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--coral)' }}>
                        Please fix the errors below.
                    </div>
                )}

                <form onSubmit={submit}>
                    {/* Company + Role */}
                    <Section title="Company & Role">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Company Name <span style={{ color: 'var(--coral)' }}>*</span></label>
                                <input type="text" className={`form-input${form.errors.company_name ? ' is-error' : ''}`}
                                    placeholder="e.g. TechVentures Pvt Ltd"
                                    value={form.data.company_name}
                                    onChange={e => form.setData('company_name', e.target.value)} />
                                {form.errors.company_name && <div className="form-error">{form.errors.company_name}</div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role Applied For <span style={{ color: 'var(--coral)' }}>*</span></label>
                                <input type="text" className={`form-input${form.errors.role_applied ? ' is-error' : ''}`}
                                    placeholder="e.g. Senior React Developer"
                                    value={form.data.role_applied}
                                    onChange={e => form.setData('role_applied', e.target.value)} />
                                {form.errors.role_applied && <div className="form-error">{form.errors.role_applied}</div>}
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Interview Date <span style={{ color: 'var(--coral)' }}>*</span></label>
                                <input type="date" className={`form-input${form.errors.interview_date ? ' is-error' : ''}`}
                                    max={new Date().toISOString().split('T')[0]}
                                    value={form.data.interview_date}
                                    onChange={e => form.setData('interview_date', e.target.value)} />
                                {form.errors.interview_date && <div className="form-error">{form.errors.interview_date}</div>}
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Outcome <span style={{ color: 'var(--coral)' }}>*</span></label>
                                <select className="form-select" value={form.data.outcome}
                                    onChange={e => form.setData('outcome', e.target.value)}>
                                    <option value="selected">✅ Selected / Offer received</option>
                                    <option value="rejected">❌ Rejected</option>
                                    <option value="ghosted">👻 Ghosted — no response</option>
                                    <option value="pending">⏳ Still in process</option>
                                </select>
                            </div>
                        </div>
                    </Section>

                    {/* Interview rounds */}
                    <Section title={`Interview Rounds (${form.data.rounds_detail.length})`}>
                        {form.errors['rounds_detail'] && (
                            <div className="form-error" style={{ marginBottom: 12 }}>{form.errors['rounds_detail']}</div>
                        )}
                        {form.data.rounds_detail.map((round, i) => (
                            <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 16, marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--violet-bright)' }}>Round {i + 1}</span>
                                    {form.data.rounds_detail.length > 1 && (
                                        <button type="button" onClick={() => removeRound(i)}
                                            style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', fontSize: 13 }}>
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Round Type</label>
                                        <select className="form-select" value={round.type}
                                            onChange={e => updateRound(i, 'type', e.target.value)}>
                                            {ROUND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Difficulty</label>
                                        <select className="form-select" value={round.difficulty}
                                            onChange={e => updateRound(i, 'difficulty', e.target.value)}>
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Description (optional)</label>
                                    <textarea className="form-input" rows={2}
                                        placeholder="What happened in this round? What was asked?"
                                        value={round.description}
                                        onChange={e => updateRound(i, 'description', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        {form.data.rounds_detail.length < 8 && (
                            <button type="button" onClick={addRound}
                                style={{ fontSize: 13, color: 'var(--violet-bright)', background: 'none', border: '1px dashed var(--violet-border)', borderRadius: 'var(--r)', padding: '8px 16px', cursor: 'pointer', width: '100%' }}>
                                + Add Round
                            </button>
                        )}
                    </Section>

                    {/* Ratings */}
                    <Section title="Your Ratings">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <RatingInput
                                label="Overall Difficulty"
                                hint="How hard was the interview overall?"
                                value={form.data.difficulty_rating}
                                onChange={v => form.setData('difficulty_rating', v)}
                            />
                            <RatingInput
                                label="Candidate Experience"
                                hint="How well were you treated throughout?"
                                value={form.data.experience_rating}
                                onChange={v => form.setData('experience_rating', v)}
                            />
                        </div>
                    </Section>

                    {/* Tips */}
                    <Section title="Tips for Future Candidates" last>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Any advice? (optional)</label>
                            <textarea className="form-input" rows={3}
                                placeholder="e.g. Focus on system design basics. They asked about LRU cache in the technical round..."
                                value={form.data.tips}
                                onChange={e => form.setData('tips', e.target.value)} />
                            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{form.data.tips.length} / 1000</div>
                        </div>
                    </Section>

                    {/* Submit */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <LoadingButton type="submit" className="btn btn-primary" loading={form.processing}
                            style={{ padding: '12px 28px', fontSize: 15 }}>
                            Post Review
                        </LoadingButton>
                        <Link href="/interviews" className="btn btn-ghost">Cancel</Link>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}

function Section({ title, children, last }) {
    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: last ? 24 : 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: 18 }}>
                {title}
            </div>
            {children}
        </div>
    );
}

function RatingInput({ label, hint, value, onChange }) {
    return (
        <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>{hint}</div>
            <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => onChange(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: star <= value ? 'var(--champagne)' : 'var(--surface3)', transition: 'color 0.1s' }}>
                        ★
                    </button>
                ))}
            </div>
        </div>
    );
}
