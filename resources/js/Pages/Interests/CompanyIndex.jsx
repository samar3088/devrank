import MainLayout from '@/Layouts/MainLayout';

export default function CompanyIndex({ requests, sent_month, monthly_limit, remaining }) {
    const pct = Math.round((sent_month / monthly_limit) * 100);
    const fillClass = pct >= 100 ? 'danger' : pct >= 75 ? 'warn' : '';

    return (
        <MainLayout title="Interest Requests Sent">
            <div className="container" style={{ paddingTop: 36, paddingBottom: 80 }}>

                {/* Header */}
                <div className="interests-header">
                    <div>
                        <h1>Sent Interest Requests</h1>
                        <p className="text-muted">
                            Track candidates you've reached out to this month.
                        </p>
                    </div>
                    <a href="/leaderboard" className="btn btn-primary btn-sm">
                        Browse Candidates →
                    </a>
                </div>

                {/* Monthly Quota */}
                <div className="quota-panel">
                    <span className="quota-label">Monthly outreach</span>
                    <div className="quota-bar-wrap">
                        <div className="quota-bar">
                            <div
                                className={`quota-fill ${fillClass}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                        </div>
                    </div>
                    <span className="quota-numbers">
                        {sent_month} / {monthly_limit}
                    </span>
                    {remaining > 0 ? (
                        <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                            {remaining} remaining
                        </span>
                    ) : (
                        <span style={{ fontSize: 12, color: 'var(--coral)' }}>
                            Limit reached — resets 1st of next month
                        </span>
                    )}
                </div>

                {/* Sent list */}
                {requests.data.length === 0 ? (
                    <EmptyState />
                ) : (
                    requests.data.map((req) => (
                        <SentCard key={req.id} request={req} />
                    ))
                )}

                {requests.last_page > 1 && (
                    <PaginationLinks links={requests.links} />
                )}
            </div>
        </MainLayout>
    );
}

function SentCard({ request }) {
    const candidate = request.candidate;
    const initials = (candidate?.name || 'CD')
        .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="sent-card">
            <div className="sent-card-avatar">{initials}</div>
            <div>
                <div className="sent-card-name">
                    {candidate?.name || 'Candidate'}
                </div>
                <div className="sent-card-rank">
                    Rank Score: {candidate?.total_rank_score ?? 0}
                </div>
            </div>
            <span className={`interest-status ${request.status}`}>
                {request.status}
            </span>
            {request.status === 'accepted' ? (
                <a href={`/candidate/${candidate?.id}`} className="btn btn-primary btn-sm">
                    Full Profile →
                </a>
            ) : (
                <span style={{ fontSize: 12, color: 'var(--text3)', minWidth: 80, textAlign: 'right' }}>
                    {formatRelative(request.created_at)}
                </span>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="interests-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
            </svg>
            <h3>No interests sent yet.</h3>
            <p>Browse the leaderboard and send interest requests to top candidates.</p>
            <a href="/leaderboard" className="btn btn-primary" style={{ marginTop: 16 }}>
                Browse Leaderboard
            </a>
        </div>
    );
}

function PaginationLinks({ links }) {
    return (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 32 }}>
            {links.map((link, i) =>
                link.url ? (
                    <a
                        key={i}
                        href={link.url}
                        className={`btn btn-sm ${link.active ? 'btn-primary' : 'btn-ghost'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={i}
                        className="btn btn-sm btn-ghost"
                        style={{ opacity: 0.4, cursor: 'default' }}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            )}
        </div>
    );
}

function formatRelative(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}
