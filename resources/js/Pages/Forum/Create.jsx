import '../../../../css/pages/forum.css';
import '../../../../css/pages/company/job-form.css';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import LoadingButton from '@/Components/LoadingButton';

export default function CreateTopic() {
    const { categories, tags } = usePage().props;
    const [tagSearch, setTagSearch] = useState('');

    const form = useForm({
        title: '',
        body: '',
        category_id: '',
        tags: [],
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.post('/forum', {
            onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        });
    }

    function toggleTag(tagId) {
        const current = [...form.data.tags];
        const index = current.indexOf(tagId);
        if (index > -1) {
            current.splice(index, 1);
        } else if (current.length < 10) {
            current.push(tagId);
        }
        form.setData('tags', current);
    }

    const filteredTags = tags.filter(t =>
        t.name.toLowerCase().includes(tagSearch.toLowerCase())
    );

    const selectedTagNames = tags
        .filter(t => form.data.tags.includes(t.id))
        .map(t => t.name);

    return (
        <MainLayout>
            <Head title="Create Topic — DevRank Forum" />
            <div className="container" style={{ paddingTop: 36, paddingBottom: 80 }}>

                {/* Page Header */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>
                        <Link href="/forum" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Forum</Link>
                        {' '} › Create Topic
                    </div>
                    <h1 style={{ marginBottom: 6 }}>Ask a Question</h1>
                    <p style={{ color: 'var(--text3)', fontSize: 14 }}>
                        Share your question with the DevRank community. Be specific and include relevant details.
                    </p>
                </div>

                {/* Global errors */}
                {Object.keys(form.errors).length > 0 && (
                    <div style={{
                        background: 'color-mix(in srgb, var(--coral) 10%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--coral) 30%, transparent)',
                        borderRadius: 'var(--r)',
                        padding: '12px 16px',
                        marginBottom: 24,
                        fontSize: 13,
                        color: 'var(--coral)',
                    }}>
                        Please fix the errors below before submitting.
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

                    {/* ── Left: Main Form ─────────────────────────────── */}
                    <form onSubmit={handleSubmit}>

                        {/* Title */}
                        <div className="job-form-section">
                            <div className="job-form-section-title">Topic Title</div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">
                                    Title <span style={{ color: 'var(--coral)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-input${form.errors.title ? ' is-error' : ''}`}
                                    placeholder="e.g. How to optimise React re-renders in a large list?"
                                    maxLength={255}
                                    value={form.data.title}
                                    onChange={e => form.setData('title', e.target.value)}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                    {form.errors.title
                                        ? <span className="form-error">{form.errors.title}</span>
                                        : <span style={{ fontSize: 11, color: 'var(--text3)' }}>Min 10 characters. Be specific.</span>
                                    }
                                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{form.data.title.length} / 255</span>
                                </div>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="job-form-section">
                            <div className="job-form-section-title">Category</div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">
                                    Select a Category <span style={{ color: 'var(--coral)' }}>*</span>
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => form.setData('category_id', cat.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                padding: '12px 14px',
                                                background: form.data.category_id === cat.id
                                                    ? 'color-mix(in srgb, var(--violet) 15%, transparent)'
                                                    : 'var(--bg)',
                                                border: form.data.category_id === cat.id
                                                    ? '1px solid var(--violet-bright)'
                                                    : '1px solid var(--border)',
                                                borderRadius: 'var(--r)',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'border-color 0.15s, background 0.15s',
                                            }}
                                        >
                                            <span style={{ fontSize: 18 }}>{cat.icon}</span>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{cat.name}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                {form.errors.category_id && (
                                    <span className="form-error" style={{ marginTop: 8, display: 'block' }}>
                                        {form.errors.category_id}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="job-form-section">
                            <div className="job-form-section-title">Your Question</div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">
                                    Description <span style={{ color: 'var(--coral)' }}>*</span>
                                </label>
                                {/* Writing tips */}
                                <div style={{
                                    background: 'color-mix(in srgb, var(--cyan) 6%, transparent)',
                                    border: '1px solid color-mix(in srgb, var(--cyan) 20%, transparent)',
                                    borderRadius: 'var(--r)',
                                    padding: '10px 14px',
                                    fontSize: 12,
                                    color: 'var(--text3)',
                                    marginBottom: 10,
                                    lineHeight: 1.6,
                                }}>
                                    💡 <strong style={{ color: 'var(--text2)' }}>Tips:</strong> Explain what you tried, what you expected, and what actually happened. Include code snippets if relevant.
                                </div>
                                <textarea
                                    className={`form-input${form.errors.body ? ' is-error' : ''}`}
                                    rows={14}
                                    placeholder={`Describe your question in detail...\n\nWhat have you tried so far?\nWhat error or unexpected behaviour are you seeing?\nWhat is your expected outcome?`}
                                    value={form.data.body}
                                    onChange={e => form.setData('body', e.target.value)}
                                    style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7 }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                    {form.errors.body
                                        ? <span className="form-error">{form.errors.body}</span>
                                        : <span style={{ fontSize: 11, color: 'var(--text3)' }}>Min 30 characters.</span>
                                    }
                                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{form.data.body.length} chars</span>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <LoadingButton
                                type="submit"
                                className="btn btn-primary"
                                loading={form.processing}
                                style={{ padding: '12px 28px', fontSize: 15 }}
                            >
                                Post Question
                            </LoadingButton>
                            <Link href="/forum" className="btn btn-ghost">
                                Cancel
                            </Link>
                        </div>
                    </form>

                    {/* ── Right: Tag Picker Sidebar ───────────────────── */}
                    <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)' }}>
                        <div className="job-form-section" style={{ marginBottom: 0 }}>
                            <div className="job-form-section-title">
                                Tags
                                <span style={{ float: 'right', fontWeight: 400, color: 'var(--text3)', fontSize: 11 }}>
                                    {form.data.tags.length} / 10 selected
                                </span>
                            </div>

                            {/* Selected tag pills */}
                            {form.data.tags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                    {selectedTagNames.map((name, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                padding: '3px 10px',
                                                background: 'color-mix(in srgb, var(--violet) 18%, transparent)',
                                                border: '1px solid var(--violet-bright)',
                                                borderRadius: 999,
                                                fontSize: 12,
                                                color: 'var(--violet-bright)',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {name}
                                            <button
                                                type="button"
                                                onClick={() => toggleTag(tags.find(t => t.name === name)?.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--violet-bright)', padding: 0, lineHeight: 1 }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {form.errors.tags && (
                                <span className="form-error" style={{ display: 'block', marginBottom: 8 }}>
                                    {form.errors.tags}
                                </span>
                            )}

                            {/* Search */}
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search tags..."
                                value={tagSearch}
                                onChange={e => setTagSearch(e.target.value)}
                                style={{ marginBottom: 10, fontSize: 13 }}
                            />

                            {/* Tag list */}
                            <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {filteredTags.length === 0 ? (
                                    <div style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>No tags found.</div>
                                ) : (
                                    filteredTags.map(tag => {
                                        const selected = form.data.tags.includes(tag.id);
                                        const disabled = !selected && form.data.tags.length >= 10;
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                disabled={disabled}
                                                onClick={() => toggleTag(tag.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '7px 10px',
                                                    borderRadius: 'var(--r)',
                                                    border: selected
                                                        ? '1px solid var(--violet-bright)'
                                                        : '1px solid transparent',
                                                    background: selected
                                                        ? 'color-mix(in srgb, var(--violet) 12%, transparent)'
                                                        : 'transparent',
                                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                                    opacity: disabled ? 0.4 : 1,
                                                    textAlign: 'left',
                                                    fontSize: 13,
                                                    color: selected ? 'var(--violet-bright)' : 'var(--text2)',
                                                    transition: 'all 0.15s',
                                                    width: '100%',
                                                }}
                                            >
                                                <span>{tag.name}</span>
                                                {selected && <span style={{ fontSize: 11 }}>✓</span>}
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>
                                Select up to 10 tags that best describe your question.
                            </div>
                        </div>

                        {/* Guidelines card */}
                        <div style={{
                            marginTop: 16,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r-lg)',
                            padding: 20,
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
                                📋 Community Guidelines
                            </div>
                            <ul style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
                                <li>Search before posting — avoid duplicates</li>
                                <li>Use a clear, specific title</li>
                                <li>Include relevant code or error messages</li>
                                <li>Be respectful and constructive</li>
                                <li>Max 10 tags per topic</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
