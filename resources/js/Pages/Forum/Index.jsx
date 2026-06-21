import '../../../css/pages/forum.css';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

export default function ForumIndex() {
    const { topics, categories, topContributors, trendingTags, filters, auth, flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const user = auth?.user;
    const isCompany = user?.roles?.includes('company');

    function handleSearch(e) {
        e.preventDefault();
        router.get('/forum', { search, category: filters?.category, filter: filters?.filter }, {
            preserveState: true,
            replace: true,
        });
    }

    function handleFilter(filter) {
        router.get('/forum', { search: filters?.search, category: filters?.category, filter }, {
            preserveState: true,
            replace: true,
        });
    }

    function handleCategory(categoryId) {
        router.get('/forum', { search: filters?.search, category: categoryId || '', filter: filters?.filter }, {
            preserveState: true,
            replace: true,
        });
    }

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

    return (
        <MainLayout>
            <Head title="Developer Forum" />
            <div className="forum-container">
                {/* Header */}
                <div className="forum-page-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <h1>Developer Forum</h1>
                            <p>Real questions. Verified human answers. Knowledge that builds your rank.</p>
                        </div>
                        {user && !isCompany && (
                            <Link href="/forum/create" className="btn-sm btn-primary-sm" style={{ padding: '10px 20px', fontSize: '14px' }}>+ New Topic</Link>
                        )}
                    </div>
                </div>

                {/* Flash */}
                {flash?.error && (
                    <div style={{ background: 'var(--coral-soft)', border: '1px solid var(--coral-border)', color: 'var(--coral)', padding: '12px 18px', borderRadius: 'var(--r)', marginBottom: '16px', fontSize: '14px' }}>
                        {flash.error}
                    </div>
                )}

                {/* Filters */}
                <div className="forum-filters">
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="forum-search-input"
                            placeholder="🔍  Search topics…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </form>
                    {['all', 'latest', 'hot', 'unanswered', 'solved'].map(f => (
                        <button
                            key={f}
                            className={`filter-btn ${(filters?.filter || 'all') === f ? 'active' : ''}`}
                            onClick={() => handleFilter(f === 'all' ? '' : f)}
                        >
                            {f === 'all' ? 'All' : f === 'hot' ? 'Hot 🔥' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Main Layout */}
                <div className="forum-layout" style={{ marginTop: '24px' }}>
                    {/* Topics List */}
                    <div>
                        {topics.data.length === 0 ? (
                            <div className="forum-empty">
                                <h3>No topics found</h3>
                                <p>Try adjusting your search or filters, or be the first to start a discussion!</p>
                            </div>
                        ) : (
                            topics.data.map(topic => (
                                <div
                                    key={topic.id}
                                    className={`topic-card ${topic.is_pinned ? 'pinned' : ''} ${topic.is_hot ? 'hot' : ''} ${topic.accepted_reply_id ? 'solved' : ''}`}
                                >
                                    <div>
                                        {/* Badges */}
                                        {(topic.is_pinned || topic.is_hot || topic.accepted_reply_id) && (
                                            <div className="topic-badges">
                                                {topic.is_pinned && <span className="badge badge-amber">📌 Pinned</span>}
                                                {topic.is_hot && <span className="badge badge-red">🔥 Hot</span>}
                                                {topic.accepted_reply_id && <span className="badge badge-green">✅ Solved</span>}
                                            </div>
                                        )}
                                        <Link href={`/forum/${topic.slug}`} className="topic-title">
                                            {topic.title}
                                        </Link>
                                        <div className="topic-meta">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="avatar-sm">{getInitials(topic.user?.name)}</div>
                                                <strong style={{ color: 'var(--text2)' }}>{topic.user?.name}</strong>
                                            </div>
                                            <span>{timeAgo(topic.created_at)}</span>
                                            {topic.tags && topic.tags.length > 0 && (
                                                <div className="tags">
                                                    {topic.tags.map(tag => (
                                                        <span key={tag.id} className="tag">{tag.name}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="topic-stats">
                                        <div className="topic-stat">💬 <strong>{topic.replies_count}</strong></div>
                                        {topic.likes_count > 0 && (
                                            <div className="topic-stat">❤️ <strong>{topic.likes_count}</strong></div>
                                        )}
                                        <div className="topic-stat">👁 <strong>{topic.views_count?.toLocaleString() || 0}</strong></div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Pagination */}
                        {topics.last_page > 1 && (
                            <div className="forum-pagination">
                                {topics.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`page-btn ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)' }}>
                        {/* Categories */}
                        <div className="sidebar-card">
                            <h4>Categories</h4>
                            <div className="category-list">
                                <div
                                    className={`category-item ${!filters?.category ? 'active' : ''}`}
                                    onClick={() => handleCategory('')}
                                >
                                    All Topics
                                    <span className="category-count">
                                        {categories.reduce((sum, c) => sum + (c.topics_count || 0), 0)}
                                    </span>
                                </div>
                                {categories.map(cat => (
                                    <div
                                        key={cat.id}
                                        className={`category-item ${parseInt(filters?.category) === cat.id ? 'active' : ''}`}
                                        onClick={() => handleCategory(cat.id)}
                                    >
                                        {cat.icon} {cat.name}
                                        <span className="category-count">{cat.topics_count || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Contributors */}
                        <div className="sidebar-card">
                            <h4>Top Contributors</h4>
                            <div>
                                {topContributors.map((user, i) => (
                                    <div key={user.id} className="top-contributor">
                                        <span className="contributor-rank">#{i + 1}</span>
                                        <div className="avatar-sm">{getInitials(user.name)}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{user.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                                                {user.total_rank_score?.toLocaleString()} pts
                                            </div>
                                        </div>
                                        {i < 2 && <span className="badge badge-cyan">Expert</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trending Tags */}
                        <div className="sidebar-card">
                            <h4>Trending Tags</h4>
                            <div className="tags">
                                {trendingTags.map(tag => (
                                    <span key={tag.id} className="tag">{tag.name}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <FullFooter />
            </div>
        </MainLayout>
    );
}