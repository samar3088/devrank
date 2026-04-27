import { useForm, usePage, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import LoadingButton from '@/Components/LoadingButton';

export default function AdminQuizCreate() {
    const { tags, quiz } = usePage().props;
    const isEdit = !!quiz;

    const form = useForm({
        title:               quiz?.title               ?? '',
        tag_id:              quiz?.tag_id              ?? '',
        description:         quiz?.description         ?? '',
        difficulty:          quiz?.difficulty          ?? 'medium',
        time_limit_minutes:  quiz?.time_limit_minutes  ?? 30,
        passing_score:       quiz?.passing_score       ?? 60,
        max_attempts:        quiz?.max_attempts        ?? 1,
        status:              quiz?.status              ?? 'draft',
    });

    function submit(e) {
        e.preventDefault();
        if (isEdit) {
            form.put(`/admin/quiz/${quiz.id}`, {
                onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
            });
        } else {
            form.post('/admin/quiz', {
                onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
            });
        }
    }

    const attemptsLabel = form.data.max_attempts == 0
        ? 'Unlimited'
        : form.data.max_attempts == 1
            ? '1 — one attempt only (default)'
            : `${form.data.max_attempts} attempts`;

    return (
        <AdminLayout title={isEdit ? `Edit: ${quiz.title}` : 'Create Quiz'}>
            <div className="admin-page-header">
                <div>
                    <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>
                        <Link href="/admin/quiz" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Quizzes</Link>
                        {' '} › {isEdit ? 'Edit' : 'Create'}
                    </div>
                    <h1>{isEdit ? 'Edit Quiz' : 'Create Quiz'}</h1>
                </div>
            </div>

            {Object.keys(form.errors).length > 0 && (
                <div style={{ background: 'var(--coral-soft)', border: '1px solid var(--coral-border)', borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--coral)' }}>
                    Please fix the errors below.
                </div>
            )}

            <div style={{ maxWidth: 680 }}>
                <form onSubmit={submit}>

                    {/* Basic info */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: 20 }}>Quiz Details</div>

                        <div className="form-group">
                            <label className="form-label">Title <span style={{ color: 'var(--coral)' }}>*</span></label>
                            <input type="text" className={`form-input${form.errors.title ? ' is-error' : ''}`}
                                placeholder="e.g. React Advanced Concepts"
                                value={form.data.title}
                                onChange={e => form.setData('title', e.target.value)} />
                            {form.errors.title && <div className="form-error">{form.errors.title}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Related Tag (Skill)</label>
                            <select className="form-select" value={form.data.tag_id}
                                onChange={e => form.setData('tag_id', e.target.value)}>
                                <option value="">No specific tag</option>
                                {tags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Description</label>
                            <textarea className="form-input" rows={3}
                                placeholder="What will candidates be tested on?"
                                value={form.data.description}
                                onChange={e => form.setData('description', e.target.value)} />
                        </div>
                    </div>

                    {/* Settings */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: 20 }}>Settings</div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Difficulty <span style={{ color: 'var(--coral)' }}>*</span></label>
                                <select className="form-select" value={form.data.difficulty}
                                    onChange={e => form.setData('difficulty', e.target.value)}>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={form.data.status}
                                    onChange={e => form.setData('status', e.target.value)}>
                                    <option value="draft">Draft — not visible to candidates</option>
                                    <option value="published">Published — live</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Time Limit (minutes) <span style={{ color: 'var(--coral)' }}>*</span></label>
                                <input type="number" className={`form-input${form.errors.time_limit_minutes ? ' is-error' : ''}`}
                                    min={5} max={180}
                                    value={form.data.time_limit_minutes}
                                    onChange={e => form.setData('time_limit_minutes', e.target.value)} />
                                {form.errors.time_limit_minutes && <div className="form-error">{form.errors.time_limit_minutes}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Passing Score (%) <span style={{ color: 'var(--coral)' }}>*</span></label>
                                <input type="number" className={`form-input${form.errors.passing_score ? ' is-error' : ''}`}
                                    min={1} max={100}
                                    value={form.data.passing_score}
                                    onChange={e => form.setData('passing_score', e.target.value)} />
                                {form.errors.passing_score && <div className="form-error">{form.errors.passing_score}</div>}
                            </div>
                        </div>

                        {/* Max attempts — full row with slider */}
                        <div className="form-group" style={{ marginBottom: 0, marginTop: 4 }}>
                            <label className="form-label">
                                Max Attempts
                                <span style={{ marginLeft: 8, fontWeight: 400, color: 'var(--cyan)' }}>{attemptsLabel}</span>
                            </label>
                            <input
                                type="range"
                                min={0} max={5} step={1}
                                value={form.data.max_attempts}
                                onChange={e => form.setData('max_attempts', parseInt(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--violet-bright)', cursor: 'pointer', marginBottom: 4 }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text4)' }}>
                                <span>∞ Unlimited</span>
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                                <span>5</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8, lineHeight: 1.5 }}>
                                {form.data.max_attempts === 0 && '⚠ Unlimited — candidates can retake as many times as they want. Only score improvements earn additional rank points.'}
                                {form.data.max_attempts === 1 && 'Default. One attempt per candidate. Strictest integrity.'}
                                {form.data.max_attempts > 1 && `Candidates can attempt up to ${form.data.max_attempts} times. Only improvements over their previous best score earn additional rank points.`}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <LoadingButton type="submit" className="btn btn-primary" loading={form.processing}>
                            {isEdit ? 'Save Changes' : 'Create Quiz'}
                        </LoadingButton>
                        <Link href="/admin/quiz" className="btn btn-ghost">Cancel</Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
