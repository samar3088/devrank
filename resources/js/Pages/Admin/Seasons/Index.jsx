import { useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminSeasons() {
    const { seasons, auth } = usePage().props;
    const canDelete = (auth?.user?.permissions ?? []).includes('quizzes.delete');
    const [showForm, setShowForm] = useState(false);

    const form = useForm({ name: '', starts_at: '', ends_at: '', activate: true });

    function submit(e) {
        e.preventDefault();
        form.post('/admin/seasons', { onSuccess: () => { form.reset(); setShowForm(false); }, preserveScroll: true });
    }

    return (
        <AdminLayout title="Seasons">
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Seasons</h1>
                    <p style={{ color: 'var(--text3)', margin: '4px 0 0' }}>Time-boxed competitions. Weekly challenges (coding/MCQ quizzes) join the active season and feed the league leaderboard.</p>
                </div>
                <button className="btn btn-primary pop-on-active" onClick={() => setShowForm(v => !v)}>
                    {showForm ? '× Cancel' : '+ New Season'}
                </button>
            </div>

            {showForm && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--violet-border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 24 }} data-reveal="scale">
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--violet-bright)' }}>New Season</div>
                    <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Name <span style={{ color: 'var(--coral)' }}>*</span></label>
                            <input className={`form-input${form.errors.name ? ' is-error' : ''}`} placeholder="e.g. Winter 2026 Season"
                                value={form.data.name} onChange={e => form.setData('name', e.target.value)} />
                            {form.errors.name && <div className="form-error">{form.errors.name}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                                <label className="form-label">Starts <span style={{ color: 'var(--coral)' }}>*</span></label>
                                <input type="date" className={`form-input${form.errors.starts_at ? ' is-error' : ''}`}
                                    value={form.data.starts_at} onChange={e => form.setData('starts_at', e.target.value)} />
                            </div>
                            <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                                <label className="form-label">Ends <span style={{ color: 'var(--coral)' }}>*</span></label>
                                <input type="date" className={`form-input${form.errors.ends_at ? ' is-error' : ''}`}
                                    value={form.data.ends_at} onChange={e => form.setData('ends_at', e.target.value)} />
                                {form.errors.ends_at && <div className="form-error">{form.errors.ends_at}</div>}
                            </div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text3)' }}>
                            <input type="checkbox" checked={form.data.activate} onChange={e => form.setData('activate', e.target.checked)} />
                            Make this the active season (deactivates any other)
                        </label>
                        <div>
                            <button type="submit" className="btn btn-primary pop-on-active" disabled={form.processing}>Create Season</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr><th>Season</th><th>Window</th><th>Challenges</th><th>Players</th><th>Status</th><th></th></tr>
                    </thead>
                    <tbody>
                        {seasons.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: 24 }}>No seasons yet — create one to start the competition.</td></tr>
                        )}
                        {seasons.map(s => (
                            <tr key={s.id}>
                                <td style={{ fontWeight: 600 }}>{s.name}</td>
                                <td style={{ color: 'var(--text3)', fontSize: 13 }}>{s.starts_at} → {s.ends_at}{s.live && s.days_left > 0 ? ` · ${s.days_left}d left` : ''}</td>
                                <td>{s.challenges}</td>
                                <td>{s.players}</td>
                                <td>
                                    {s.live
                                        ? <span style={{ color: 'var(--emerald, #10b981)', fontWeight: 600 }}>● Live</span>
                                        : s.is_active
                                            ? <span style={{ color: 'var(--amber, #f59e0b)' }}>Active (out of window)</span>
                                            : <span style={{ color: 'var(--text4)' }}>Inactive</span>}
                                </td>
                                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    {!s.is_active
                                        ? <button className="admin-action-btn" onClick={() => router.post(`/admin/seasons/${s.id}/activate`, {}, { preserveScroll: true })}>Activate</button>
                                        : <button className="admin-action-btn" onClick={() => router.post(`/admin/seasons/${s.id}/close`, {}, { preserveScroll: true })}>Close</button>}
                                    {canDelete && (
                                        <button className="admin-action-btn red" style={{ marginLeft: 6 }}
                                            onClick={() => { if (confirm(`Delete “${s.name}”? Its season scores are removed.`)) router.delete(`/admin/seasons/${s.id}`, { preserveScroll: true }); }}>
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
