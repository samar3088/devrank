import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import LoadingButton from '@/Components/LoadingButton';
import CountUp from '@/Components/CountUp';

const BLANK = { name: '', description: '', icon: '', color: '#7c6dfa', sort_order: 0 };

export default function AdminCategories() {
    const { categories, errors: pageErrors = {} } = usePage().props;
    const [editingId, setEditingId] = useState(null);

    const form = useForm({ ...BLANK });

    function startCreate() {
        setEditingId(null);
        form.clearErrors();
        form.setData({ ...BLANK });
    }

    function startEdit(cat) {
        setEditingId(cat.id);
        form.clearErrors();
        form.setData({
            name:        cat.name ?? '',
            description: cat.description ?? '',
            icon:        cat.icon ?? '',
            color:       cat.color ?? '#7c6dfa',
            sort_order:  cat.sort_order ?? 0,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function submit(e) {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: startCreate };
        if (editingId) {
            form.put(`/admin/categories/${editingId}`, opts);
        } else {
            form.post('/admin/categories', opts);
        }
    }

    function toggle(id) {
        router.post(`/admin/categories/${id}/toggle`, {}, { preserveScroll: true });
    }

    function destroy(cat) {
        if (!confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
        router.delete(`/admin/categories/${cat.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Forum Categories">
            <div className="admin-page-header" data-reveal>
                <div>
                    <h1>Forum Categories</h1>
                    <p><CountUp end={categories.length} /> categories</p>
                </div>
            </div>

            {pageErrors.category && (
                <div style={{ background: 'var(--coral-soft)', border: '1px solid var(--coral-border)', borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--coral)' }}>
                    {pageErrors.category}
                </div>
            )}

            {/* ── Add / Edit form ─────────────────────────────── */}
            <div
                className="hover-lift"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 24, maxWidth: 760 }}
                data-reveal
            >
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: 20 }}>
                    {editingId ? 'Edit Category' : 'Add Category'}
                </div>

                <form onSubmit={submit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Name <span style={{ color: 'var(--coral)' }}>*</span></label>
                            <input type="text" className={`form-input${form.errors.name ? ' is-error' : ''}`}
                                placeholder="e.g. JavaScript"
                                value={form.data.name}
                                onChange={e => form.setData('name', e.target.value)} />
                            {form.errors.name && <div className="form-error">{form.errors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Icon (emoji)</label>
                            <input type="text" className={`form-input${form.errors.icon ? ' is-error' : ''}`}
                                placeholder="🟨" maxLength={8}
                                value={form.data.icon}
                                onChange={e => form.setData('icon', e.target.value)} />
                            {form.errors.icon && <div className="form-error">{form.errors.icon}</div>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className={`form-input${form.errors.description ? ' is-error' : ''}`} rows={2}
                            placeholder="What belongs in this category?"
                            value={form.data.description}
                            onChange={e => form.setData('description', e.target.value)} />
                        {form.errors.description && <div className="form-error">{form.errors.description}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Color</label>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <input type="color" style={{ width: 44, height: 38, padding: 2, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: 'pointer' }}
                                    value={/^#[0-9a-fA-F]{6}$/.test(form.data.color) ? form.data.color : '#7c6dfa'}
                                    onChange={e => form.setData('color', e.target.value)} />
                                <input type="text" className={`form-input${form.errors.color ? ' is-error' : ''}`}
                                    placeholder="#7c6dfa" maxLength={7}
                                    value={form.data.color}
                                    onChange={e => form.setData('color', e.target.value)} />
                            </div>
                            {form.errors.color && <div className="form-error">{form.errors.color}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Sort Order</label>
                            <input type="number" className={`form-input${form.errors.sort_order ? ' is-error' : ''}`}
                                min={0}
                                value={form.data.sort_order}
                                onChange={e => form.setData('sort_order', e.target.value)} />
                            {form.errors.sort_order && <div className="form-error">{form.errors.sort_order}</div>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <LoadingButton type="submit" className="btn btn-primary pop-on-active" loading={form.processing}>
                            {editingId ? 'Save Changes' : 'Add Category'}
                        </LoadingButton>
                        {editingId && (
                            <button type="button" className="btn btn-ghost" onClick={startCreate}>Cancel</button>
                        )}
                    </div>
                </form>
            </div>

            {/* ── Category list ───────────────────────────────── */}
            <div className="admin-table-wrap" data-reveal="fade">
                <table className="admin-table">
                    <thead>
                        <tr><th>Category</th><th>Slug</th><th>Color</th><th>Topics</th><th>Order</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr><td colSpan={7} className="admin-empty">No categories yet.</td></tr>
                        ) : categories.map(cat => (
                            <tr key={cat.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 18 }}>{cat.icon || '🗂️'}</span>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{cat.name}</div>
                                            {cat.description && (
                                                <div style={{ fontSize: 12, color: 'var(--text3)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {cat.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontSize: 13, color: 'var(--text3)', fontFamily: 'var(--font-mono, monospace)' }}>{cat.slug}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ width: 16, height: 16, borderRadius: 4, background: cat.color || 'var(--border)', border: '1px solid var(--border)', display: 'inline-block' }} />
                                        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{cat.color || '—'}</span>
                                    </div>
                                </td>
                                <td><span style={{ fontWeight: 600 }}>{cat.topics_count ?? 0}</span></td>
                                <td>{cat.sort_order}</td>
                                <td>
                                    <span className={`admin-badge admin-badge-${cat.is_active ? 'green' : 'gray'}`}>
                                        {cat.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button onClick={() => startEdit(cat)} className="admin-action-btn pop-on-active">Edit</button>
                                        <button onClick={() => toggle(cat.id)} className="admin-action-btn amber pop-on-active">
                                            {cat.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button onClick={() => destroy(cat)} className="admin-action-btn red pop-on-active">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
