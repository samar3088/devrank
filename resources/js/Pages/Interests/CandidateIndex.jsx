import { useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import LoadingButton from '@/Components/LoadingButton';

export default function CandidateIndex({ requests, pending }) {
    return (
        <MainLayout title="Interest Requests">
            <div className="container" style={{ paddingTop: 36, paddingBottom: 80 }}>

                {/* Header */}
                <div className="interests-header">
                    <div>
                        <h1>Interest Requests</h1>
                        <p className="text-muted">
                            Companies that want to connect with you. Accept to share your full profile.
                        </p>
                    </div>
                    {pending > 0 && (
                        <span className="pending-badge">
                            {pending} pending
                        </span>
                    )}
                </div>

                {/* Privacy Note */}
                <div className="privacy-note">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>
                        Your full profile (resume, email, phone, experience) is hidden until you accept.
                        Companies only see your public ranking and tags before you accept.
                    </span>
                </div>

                {/* Request List */}
                {requests.data.length === 0 ? (
                    <EmptyState
                        message="No interest requests yet."
                        sub="When companies want to connect, they'll appear here."
                    />
                ) : (
                    requests.data.map((req) => (
                        <RequestCard key={req.id} request={req} />
                    ))
                )}

                {/* Pagination */}
                {requests.last_page > 1 && (
                    <PaginationLinks links={requests.links} />
                )}

            </div>
        </MainLayout>
    );
}

function RequestCard({ request }) {
    const { post, processing } = useForm({});

    function respond(action) {
        post(`/interests/${request.id}/respond`, {
            data: { action },
            preserveScroll: true,
        });
    }

    const company = request.company;
    const initials = (company?.company_name || company?.name || 'CO')
        .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className={`request-card is-${request.status}`}>
            <div className="request-header">
                <div className="request-company">
                    <div className="request-company-avatar">{initials}</div>
                    <div>
                        <div className="request-company-name">
                            {company?.company_name || company?.name}
                        </div>
                        <div className="request-company-meta">
                            Sent {formatRelative(request.created_at)}
                        </div>
                    </div>
                </div>
                <span className={`interest-status ${request.status}`}>
                    {request.status}
                </span>
            </div>

            {request.message && (
                <div className="request-message">{request.message}</div>
            )}

            <div className="request-actions">
                {request.status === 'pending' && (
                    <>
                        <LoadingButton
                            className="btn btn-primary btn-sm"
                            loading={processing}
                            onClick={() => respond('accepted')}
                        >
                            Accept
                        </LoadingButton>
                        <LoadingButton
                            className="btn btn-ghost btn-sm"
                            loading={processing}
                            onClick={() => respond('declined')}
                        >
                            Decline
                        </LoadingButton>
                    </>
                )}
                {request.status === 'accepted' && (
                    <a
                        href={`/company/${company?.id}`}
                        className="btn btn-ghost btn-sm"
                    >
                        View Company →
                    </a>
                )}
            </div>
        </div>
    );
}

function EmptyState({ message, sub }) {
    return (
        <div className="interests-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
            <h3>{message}</h3>
            <p>{sub}</p>
        </div>
    );
}

function PaginationLinks({ links }) {
    return (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 32 }}>
            {links.map((link, i) => (
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
            ))}
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
