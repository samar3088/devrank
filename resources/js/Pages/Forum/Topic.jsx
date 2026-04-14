import '../../../css/pages/forum-topic.css';
import '../../../css/pages/forum.css';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import LoadingButton from '@/Components/LoadingButton';
import { FullFooter } from '@/Components/Footer';

export default function ForumTopic() {
    const { topic, replies, auth, flash } = usePage().props;
    const user = auth?.user;
    const isCompany = user?.roles?.includes('company');

    const replyForm = useForm({
        body: '',
    });

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    function timeAgo(date) {
        if (!date) return '';
        const now = new Date();
        const d = new Date(date);
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }

    function handleReplySubmit(e) {
        e.preventDefault();
        replyForm.post(`/forum/${topic.id}/reply`, {
            onSuccess: () => replyForm.reset(),
            onFinish: () => {
                if (Object.keys(replyForm.errors).length > 0) {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }
            },
        });
    }

    function handleLike(replyId) {
        router.post(`/forum/reply/${replyId}/like`, {}, {
            preserveScroll: true,
        });
    }

    return (
        <MainLayout>
            <Head title={topic.title} />
            <div className="topic-container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link href="/forum">Forum</Link> › <Link href={`/forum?category=${topic.category?.id}`}>{topic.category?.name}</Link> › Topic
                </div>

                <div className="topic-layout">
                    {/* Main Content */}
                    <div>
                        {/* Topic Header */}
                        <div className="topic-header">
                            <div className="topic-header-badges">
                                {topic.is_pinned && <span className="badge badge-amber">📌 Pinned</span>}
                                {topic.is_hot && <span className="badge badge-red">🔥 Hot</span>}
                                {topic.category && <span className="badge badge-cyan">{topic.category.name}</span>}
                                {topic.tags?.map(tag => (
                                    <span key={tag.id} className="badge badge-muted">{tag.name}</span>
                                ))}
                            </div>
                            <h2>{topic.title}</h2>
                            <div className="topic-header-meta">
                                <span>Asked by <a href="#">{topic.user?.name}</a></span>
                                <span>{timeAgo(topic.created_at)}</span>
                                <span>👁 {topic.views_count?.toLocaleString()} views</span>
                                <span>💬 {topic.replies_count} answers</span>
                                <span>❤️ {topic.likes_count} total likes</span>
                            </div>
                        </div>

                        {/* Flash */}
                        {flash?.success && (
                            <div style={{ background: 'var(--emerald-soft)', border: '1px solid var(--emerald-border)', color: 'var(--emerald)', padding: '12px 18px', borderRadius: 'var(--r)', marginBottom: '16px', fontSize: '14px' }}>
                                ✓ {flash.success}
                            </div>
                        )}
                        {flash?.error && (
                            <div style={{ background: 'var(--coral-soft)', border: '1px solid var(--coral-border)', color: 'var(--coral)', padding: '12px 18px', borderRadius: 'var(--r)', marginBottom: '16px', fontSize: '14px' }}>
                                {flash.error}
                            </div>
                        )}

                        {/* Question Body */}
                        <div className="answer-card question">
                            <div className="answer-author">
                                <div className="avatar-md">{getInitials(topic.user?.name)}</div>
                                <div className="answer-author-info">
                                    <div className="name">
                                        <a href="#">{topic.user?.name}</a>
                                        {topic.user?.total_rank_score > 0 && (
                                            <span className="badge badge-cyan" style={{ marginLeft: '6px' }}>
                                                {topic.user.total_rank_score.toLocaleString()} pts
                                            </span>
                                        )}
                                    </div>
                                    <div className="meta">
                                        <span>Asked {timeAgo(topic.created_at)}</span>
                                        {topic.user?.human_score > 0 && (
                                            <span className="hs-inline">
                                                <span className="hs-bar-sm"><span className="hs-fill-sm" style={{ width: `${topic.user.human_score}%` }}></span></span>
                                                {topic.user.human_score}% Human
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="answer-body" dangerouslySetInnerHTML={{ __html: formatBody(topic.body) }} />
                            <div className="tags">
                                {topic.tags?.map(tag => (
                                    <span key={tag.id} className="tag">{tag.name}</span>
                                ))}
                            </div>
                        </div>

                        {/* Sort Bar */}
                        <div className="sort-bar">
                            <h4>{topic.replies_count} Answers</h4>
                            <div className="sort-options">
                                <span>Sort by:</span>
                                <button className="sort-btn active">Most Liked</button>
                                <button className="sort-btn">Newest</button>
                            </div>
                        </div>

                        {/* Answers */}
                        {replies.map(reply => (
                            <div key={reply.id} className={`answer-card ${reply.is_accepted ? 'accepted' : ''}`}>
                                {reply.is_accepted && (
                                    <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                                        <span className="accepted-badge">✅ Accepted Answer</span>
                                    </div>
                                )}
                                <div className="answer-author">
                                    <div className="avatar-md">{getInitials(reply.user?.name)}</div>
                                    <div className="answer-author-info">
                                        <div className="name">
                                            <a href="#">{reply.user?.name}</a>
                                            {reply.is_accepted && <span className="badge badge-green" style={{ marginLeft: '6px' }}>Expert</span>}
                                        </div>
                                        <div className="meta">
                                            <span>{timeAgo(reply.created_at)}</span>
                                            {reply.user?.human_score > 0 && (
                                                <span className="hs-inline">
                                                    <span className="hs-bar-sm"><span className="hs-fill-sm" style={{ width: `${reply.user.human_score}%` }}></span></span>
                                                    {reply.user.human_score}% Human
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="answer-body" dangerouslySetInnerHTML={{ __html: formatBody(reply.body) }} />
                                <div className="answer-actions">
                                    {user && !isCompany ? (
                                        <button
                                            className={`like-btn ${reply.is_liked ? 'liked' : ''}`}
                                            onClick={() => handleLike(reply.id)}
                                        >
                                            ❤️ <span>{reply.likes_count}</span> Likes
                                        </button>
                                    ) : (
                                        <span className="like-btn" style={{ cursor: 'default' }}>
                                            ❤️ <span>{reply.likes_count}</span> Likes
                                        </span>
                                    )}
                                    {reply.is_accepted && (
                                        <span style={{ fontSize: '12px', color: 'var(--text3)', marginLeft: 'auto' }}>
                                            +{reply.likes_count * 10} rank points awarded
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Write Answer */}
                        {user && !isCompany ? (
                            <div className="write-answer">
                                <h4>Write Your Answer</h4>
                                <div className="write-answer-info">
                                    <span>💡</span>
                                    <span>All answers are checked for AI-generated content. Write in your own words — this is what builds your rank.</span>
                                </div>
                                <form onSubmit={handleReplySubmit}>
                                    <textarea
                                        className="write-textarea"
                                        placeholder="Share your experience and knowledge. Be specific — detailed, original answers earn the most likes and rank points."
                                        value={replyForm.data.body}
                                        onChange={e => replyForm.setData('body', e.target.value)}
                                    />
                                    {replyForm.errors.body && (
                                        <div style={{ color: 'var(--coral)', fontSize: '12px', marginTop: '6px' }}>{replyForm.errors.body}</div>
                                    )}
                                    <div className="ai-warning">
                                        🤖 Tip: Answers with code examples, real-world experience, and specific explanations score highest for human authenticity.
                                    </div>
                                    <div className="write-actions">
                                        <LoadingButton
                                            type="submit"
                                            loading={replyForm.processing}
                                            className="btn-sm btn-primary-sm"
                                            style={{ padding: '10px 24px', fontSize: '14px' }}
                                        >
                                            {replyForm.processing ? 'Posting...' : 'Post Answer (+pts)'}
                                        </LoadingButton>
                                    </div>
                                </form>
                            </div>
                        ) : !user ? (
                            <div className="login-prompt">
                                <p>Log in to post your answer and earn rank points.</p>
                                <Link href="/account" className="btn-sm btn-primary-sm" style={{ padding: '10px 24px', fontSize: '14px' }}>
                                    Log In to Answer
                                </Link>
                            </div>
                        ) : (
                            <div className="login-prompt">
                                <p>Company accounts cannot post forum answers. Only candidates can participate in discussions.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="topic-aside">
                        {/* Topic Stats */}
                        <div className="sidebar-card">
                            <h4>Topic Stats</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div className="topic-stat-row"><span className="topic-stat-label">Views</span><span className="topic-stat-value">{topic.views_count?.toLocaleString()}</span></div>
                                <div className="topic-stat-row"><span className="topic-stat-label">Answers</span><span className="topic-stat-value">{topic.replies_count}</span></div>
                                <div className="topic-stat-row"><span className="topic-stat-label">Total Likes</span><span className="topic-stat-value" style={{ color: 'var(--violet-bright)' }}>{topic.likes_count}</span></div>
                                <div className="topic-stat-row"><span className="topic-stat-label">Asked</span><span className="topic-stat-value">{timeAgo(topic.created_at)}</span></div>
                            </div>
                        </div>

                        {/* Share */}
                        <div className="sidebar-card">
                            <h4>Share This Topic</h4>
                            <div className="share-buttons">
                                <button className="share-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}>🔗 Copy Link</button>
                                <button className="share-btn" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(topic.title)}`, '_blank')}>Twitter/X</button>
                                <button className="share-btn" onClick={() => window.open(`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(topic.title)}`, '_blank')}>LinkedIn</button>
                            </div>
                        </div>
                    </div>
                </div>

                <FullFooter />
            </div>
        </MainLayout>
    );
}

/**
 * Format body text — convert newlines and markdown-lite
 */
function formatBody(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}