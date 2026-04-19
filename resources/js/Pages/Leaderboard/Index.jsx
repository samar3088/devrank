import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { FullFooter } from '@/Components/Footer';

export default function LeaderboardIndex() {
    const { candidates, tags, filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');

    function handleSearch(e) {
        e.preventDefault();
        router.get('/leaderboard', { search, tag: filters?.tag }, {
            preserveState: true,
            replace: true,
        });
    }

    function handleTag(tagSlug) {
        router.get('/leaderboard', {
            search: filters?.search,
            tag: filters?.tag === tagSlug ? '' : tagSlug,
        }, {
            preserveState: true,
            replace: true,
        });
    }

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    function getRankClass(index) {
        if (index === 0) return 'rank-1';
        if (index === 1) return 'rank-2';
        if (index === 2) return 'rank-3';
        return '';
    }

    function getRankBadgeClass(index) {
        if (index === 0) return 'gold';
        if (index === 1) return 'silver';
        if (index === 2) return 'bronze';
        return '';
    }

    const tagButtons = [
        { slug: '', label: 'All Skills' },
        { slug: 'react', label: '⚛️ React' },
        { slug: 'node-js', label: '🟢 Node.js' },
        { slug: 'system-design', label: '🏗️ System Design' },
        { slug: 'laravel', label: '🔴 Laravel' },
        { slug: 'aws', label: '☁️ AWS' },
        { slug: 'python', label: '🐍 Python' },
        { slug: 'sql', label: '🗄️ SQL' },
        { slug: 'docker', label: '🐳 Docker' },
    ];

    return (
        <MainLayout>
            <Head title="Developer Leaderboard" />
            <div className="lb-container">
                {/* Hero */}
                <div className="lb-hero">
                    <div className="lb-hero-top">
                        <div>
                            <h1>Developer Leaderboard</h1>
                            <p>Ranked by verified forum answers, quizzes, interviews, and platform demand signals.</p>
                        </div>
                        <div className="lb-hero-stats">
                            <div className="lb-hero-stat">
                                <div className="stat-label">Total Ranked</div>
                                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{candidates?.total || 0}</div>
                            </div>
                            <div className="lb-hero-stat">
                                <div className="stat-label">Updated</div>
                                <div className="stat-value" style={{ fontSize: '1.5rem' }}>Live</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tag Filter */}
                <div className="tag-filter">
                    {tagButtons.map(t => (
                        <button
                            key={t.slug}
                            className={`tag-filter-btn ${(filters?.tag || '') === t.slug ? 'active' : ''}`}
                            onClick={() => handleTag(t.slug)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="lb-table-wrap">
                    <div className="lb-controls">
                        <div className="lb-controls-left">
                            <form onSubmit={handleSearch}>
                                <input
                                    type="text"
                                    className="lb-search"
                                    placeholder="Search candidates…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </form>
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--text3)' }}>
                            Showing {candidates?.from || 0}–{candidates?.to || 0} of {candidates?.total || 0}
                        </span>
                    </div>

                    <table className="lb-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Candidate</th>
                                <th>Human Score</th>
                                <th>Forum</th>
                                <th>Answers</th>
                                <th>Likes</th>
                                <th>Total Score</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates?.data?.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                                        No candidates found matching your filters.
                                    </td>
                                </tr>
                            )}
                            {candidates?.data?.map((candidate, i) => (
                                <tr key={candidate.id} className={getRankClass(i)}>
                                    <td>
                                        <div className={`rank-badge ${getRankBadgeClass(i)}`}>
                                            #{(candidates.from || 1) + i}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="lb-user-cell">
                                            <div className="home-avatar">{getInitials(candidate.name)}</div>
                                            <div>
                                                <span className="lb-user-name">{candidate.name}</span>
                                                <div className="lb-user-meta">{candidate.location || 'India'} · {candidate.years_of_experience || '—'} yrs</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="human-score">
                                            <div className="hs-bar"><div className="hs-fill" style={{ width: `${candidate.human_score || 0}%` }}></div></div>
                                            {candidate.human_score || 0}%
                                        </div>
                                    </td>
                                    <td className="mono">{candidate.topics_count || 0}</td>
                                    <td className="mono">{candidate.replies_count || 0}</td>
                                    <td className="mono">{candidate.likes_received || 0}</td>
                                    <td>
                                        <strong className="score-total">{candidate.total_rank_score?.toLocaleString() || 0}</strong>
                                    </td>
                                    <td>
                                        <Link href="#" className="btn-sm btn-outline-sm">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {candidates?.last_page > 1 && (
                        <div className="forum-pagination" style={{ padding: '20px' }}>
                            {candidates.links.map((link, i) => (
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

                <FullFooter />
            </div>
        </MainLayout>
    );
}
