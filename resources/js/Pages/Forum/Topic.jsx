import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import LoadingButton from '@/Components/LoadingButton';
import { FullFooter } from '@/Components/Footer';

export default function ForumTopic() {
    const { topic, replies, auth, flash } = usePage().props;
    const user       = auth?.user;
    const isGuest    = !user;
    const isCandidate = user?.roles?.some(r => r.name === 'candidate');
    const isTopicOwner = user?.id === topic.user_id;

    const replyForm = useForm({ body: '' });

    function submitReply(e) {
        e.preventDefault();
        replyForm.post(`/forum/${topic.id}/reply`, {
            onSuccess: () => replyForm.reset(),
            preserveScroll: true,
        });
    }

    function deleteTopic() {
        if (!confirm('Delete this topic? This cannot be undone.')) return;
        router.delete(`/forum/${topic.id}`, { preserveScroll: false });
    }

    function copyLink() {
        navigator.clipboard.writeText(window.location.href);
    }

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    function formatDate(d) {
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    return (
        <MainLayout>
            <Head title={`${topic.title} — DevRank Forum`} />
            <div className="profile-container">

                {/* Flash */}
                {flash?.success && (
                    <div style={{ background: 'color-mix(in srgb, var(--emerald) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--emerald) 30%, transparent)', borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--emerald)' }}>
                        {flash.success}
                    </div>
                )}

                {/* Breadcrumb */}
                <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
                    <Link href="/forum" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Forum</Link>
                    {topic.category && <> › <Link href={`/forum?category=${topic.category.slug}`} style={{ color: 'var(--text3)', textDecoration: 'none' }}>{topic.category.name}</Link></>}
                    {' '} › <span style={{ color: 'var(--text2)' }}>{topic.title.slice(0, 50)}{topic.title.length > 50 ? '…' : ''}</span>
                </div>

                <div className="topic-layout">
                    {/* ── Main Column ───────────────────────────────────── */}
                    <div>
                        {/* Topic Header */}
                        <div className="topic-header-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                                <h1 className="topic-title">{topic.title}</h1>
                                {isTopicOwner && (
                                    <button
                                        onClick={deleteTopic}
                                        style={{ flexShrink: 0, background: 'none', border: '1px solid var(--coral)', color: 'var(--coral)', borderRadius: 'var(--r)', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}
                                    >
                                        Delete Topic
                                    </button>
                                )}
                            </div>

                            {/* Meta row */}
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16, fontSize: 13, color: 'var(--text3)' }}>
                                <span>
                                    <Link href={`/candidate/${topic.user_id}`} style={{ color: 'var(--violet-bright)', fontWeight: 600, textDecoration: 'none' }}>
                                        {topic.user?.name}
                                    </Link>
                                </span>
                                <span>📅 {formatDate(topic.created_at)}</span>
                                <span>👁 {topic.views_count?.toLocaleString()} views</span>
                                <span>💬 {topic.replies_count} answers</span>
                                {topic.is_pinned && <span className="badge badge-amber">📌 Pinned</span>}
                                {topic.is_hot   && <span className="badge badge-cyan">🔥 Hot</span>}
                                {topic.status === 'closed' && <span className="badge" style={{ background: 'color-mix(in srgb, var(--text3) 15%, transparent)', color: 'var(--text3)' }}>🔒 Closed</span>}
                            </div>

                            {/* Tags */}
                            {topic.tags?.length > 0 && (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                                    {topic.tags.map(tag => (
                                        <Link key={tag.id} href={`/forum?tag=${tag.slug}`} className="tag" style={{ textDecoration: 'none' }}>{tag.name}</Link>
                                    ))}
                                </div>
                            )}

                            {/* Body */}
                            <div className="topic-body" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 15, color: 'var(--text2)' }}>
                                {topic.body}
                            </div>
                        </div>

                        {/* ── Answers ───────────────────────────────────── */}
                        <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)' }}>
                            {replies.length} {replies.length === 1 ? 'Answer' : 'Answers'}
                        </div>

                        {replies.map(reply => (
                            <ReplyCard
                                key={reply.id}
                                reply={reply}
                                topic={topic}
                                authUser={user}
                                isCandidate={isCandidate}
                                isTopicOwner={isTopicOwner}
                                getInitials={getInitials}
                                formatDate={formatDate}
                            />
                        ))}

                        {/* ── Reply Form ────────────────────────────────── */}
                        {isGuest && (
                            <div className="login-prompt">
                                <p>Join DevRank to post your answer and build your rank.</p>
                                <Link href="/account" className="btn btn-primary">Login / Register</Link>
                            </div>
                        )}

                        {user && !isCandidate && (
                            <div className="login-prompt">
                                <p style={{ color: 'var(--text3)' }}>🔒 Company accounts cannot post forum answers.</p>
                            </div>
                        )}

                        {isCandidate && topic.status === 'open' && (
                            <div className="answer-form-card" style={{ marginTop: 32 }}>
                                <h3 style={{ marginBottom: 16 }}>Your Answer</h3>
                                <form onSubmit={submitReply}>
                                    <textarea
                                        className={`form-input${replyForm.errors.body ? ' is-error' : ''}`}
                                        rows={8}
                                        placeholder="Write a detailed, helpful answer. Explain your reasoning and include code examples if relevant."
                                        value={replyForm.data.body}
                                        onChange={e => replyForm.setData('body', e.target.value)}
                                        style={{ resize: 'vertical', lineHeight: 1.7, fontFamily: 'inherit' }}
                                    />
                                    {replyForm.errors.body && <div className="form-error">{replyForm.errors.body}</div>}
                                    <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
                                        <LoadingButton type="submit" className="btn btn-primary" loading={replyForm.processing}>
                                            Post Answer
                                        </LoadingButton>
                                        <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                                            {replyForm.data.body.length} chars · min 10
                                        </span>
                                    </div>
                                </form>
                            </div>
                        )}

                        {isCandidate && topic.status === 'closed' && (
                            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text3)', fontSize: 14 }}>
                                🔒 This topic is closed — no new answers.
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar ───────────────────────────────────────── */}
                    <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)' }}>

                        {/* Stats card */}
                        <div className="profile-sidebar-card">
                            <h4 style={{ marginBottom: 14 }}>Topic Stats</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text3)' }}>Answers</span>
                                    <strong>{topic.replies_count}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text3)' }}>Views</span>
                                    <strong>{topic.views_count?.toLocaleString()}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text3)' }}>Asked</span>
                                    <strong>{formatDate(topic.created_at)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text3)' }}>Category</span>
                                    <strong style={{ color: 'var(--cyan)' }}>{topic.category?.name}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Share card */}
                        <div className="profile-sidebar-card">
                            <h4 style={{ marginBottom: 14 }}>Share</h4>
                            <div className="share-buttons">
                                <button className="share-btn" onClick={copyLink}>
                                    🔗 Copy Link
                                </button>
                                <a
                                    className="share-btn"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(topic.title)}&url=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    𝕏 Share on X
                                </a>
                                <a
                                    className="share-btn"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    in Share on LinkedIn
                                </a>
                            </div>
                        </div>

                        {/* Tags card */}
                        {topic.tags?.length > 0 && (
                            <div className="profile-sidebar-card">
                                <h4 style={{ marginBottom: 12 }}>Tags</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {topic.tags.map(tag => (
                                        <Link key={tag.id} href={`/forum?tag=${tag.slug}`} className="tag" style={{ textDecoration: 'none' }}>
                                            {tag.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <FullFooter />
            </div>
        </MainLayout>
    );
}

/* ── Reply Card ─────────────────────────────────────────────────── */
function ReplyCard({ reply, topic, authUser, isCandidate, isTopicOwner, getInitials, formatDate }) {
    const [editing, setEditing]  = useState(false);
    const isOwner = authUser?.id === reply.user_id;

    const editForm = useForm({ body: reply.body });

    function submitEdit(e) {
        e.preventDefault();
        editForm.put(`/forum/reply/${reply.id}`, {
            onSuccess: () => setEditing(false),
            preserveScroll: true,
        });
    }

    function deleteReply() {
        if (!confirm('Delete this answer?')) return;
        router.delete(`/forum/reply/${reply.id}`, { preserveScroll: true });
    }

    function toggleLike() {
        router.post(`/forum/reply/${reply.id}/like`, {}, { preserveScroll: true });
    }

    function acceptAnswer() {
        router.post(`/forum/${topic.id}/accept/${reply.id}`, {}, { preserveScroll: true });
    }

    return (
        <div className={`answer-card${reply.is_accepted ? ' answer-accepted' : ''}`} style={{ marginBottom: 16 }}>

            {reply.is_accepted && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--emerald)', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                    ✅ Accepted Answer
                </div>
            )}

            {/* Author row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--violet-bright)', flexShrink: 0 }}>
                        {getInitials(reply.user?.name)}
                    </div>
                    <div>
                        <Link href={`/candidate/${reply.user_id}`} style={{ fontWeight: 600, fontSize: 14, textDecoration: 'none', color: 'var(--text)' }}>
                            {reply.user?.name}
                        </Link>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                            {reply.user?.total_rank_score?.toLocaleString()} pts · {formatDate(reply.created_at)}
                            {reply.updated_at !== reply.created_at && <span style={{ marginLeft: 6 }}>(edited)</span>}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isOwner && !editing && (
                        <>
                            <button
                                onClick={() => setEditing(true)}
                                style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text3)', borderRadius: 'var(--r)', padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={deleteReply}
                                style={{ background: 'none', border: '1px solid var(--coral)', color: 'var(--coral)', borderRadius: 'var(--r)', padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
                            >
                                Delete
                            </button>
                        </>
                    )}
                    {/* Accept button: only topic owner (candidate) can accept, not on their own reply */}
                    {isTopicOwner && !isOwner && isCandidate && (
                        <button
                            onClick={acceptAnswer}
                            style={{
                                background: reply.is_accepted ? 'color-mix(in srgb, var(--emerald) 15%, transparent)' : 'none',
                                border: `1px solid ${reply.is_accepted ? 'var(--emerald)' : 'var(--border)'}`,
                                color: reply.is_accepted ? 'var(--emerald)' : 'var(--text3)',
                                borderRadius: 'var(--r)',
                                padding: '4px 10px',
                                fontSize: 12,
                                cursor: 'pointer',
                            }}
                        >
                            {reply.is_accepted ? '✅ Accepted' : '✓ Accept'}
                        </button>
                    )}
                </div>
            </div>

            {/* Body or edit form */}
            {editing ? (
                <form onSubmit={submitEdit}>
                    <textarea
                        className={`form-input${editForm.errors.body ? ' is-error' : ''}`}
                        rows={6}
                        value={editForm.data.body}
                        onChange={e => editForm.setData('body', e.target.value)}
                        style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7, marginBottom: 10 }}
                    />
                    {editForm.errors.body && <div className="form-error">{editForm.errors.body}</div>}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <LoadingButton type="submit" className="btn btn-primary btn-sm" loading={editForm.processing}>
                            Save
                        </LoadingButton>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); editForm.reset(); }}>
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="answer-body" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 14, color: 'var(--text2)' }}>
                    {reply.body}
                </div>
            )}

            {/* Like button */}
            {!editing && (
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={toggleLike}
                        disabled={!isCandidate}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: reply.is_liked ? 'color-mix(in srgb, var(--violet) 15%, transparent)' : 'none',
                            border: `1px solid ${reply.is_liked ? 'var(--violet-bright)' : 'var(--border)'}`,
                            color: reply.is_liked ? 'var(--violet-bright)' : 'var(--text3)',
                            borderRadius: 'var(--r)',
                            padding: '6px 14px',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: isCandidate ? 'pointer' : 'default',
                            transition: 'all 0.15s',
                        }}
                        title={!isCandidate ? 'Only candidates can like answers' : ''}
                    >
                        ▲ {reply.likes_count}
                    </button>
                    {!isCandidate && authUser && (
                        <span style={{ fontSize: 12, color: 'var(--text3)' }}>Companies cannot like answers</span>
                    )}
                </div>
            )}
        </div>
    );
}
