import { Head, usePage, router, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

function getCookie(name) {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
}

function timeAgo(iso) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NotificationsIndex() {
    const { notifications } = usePage().props;
    const list = notifications?.data ?? [];
    const unreadCount = list.filter(n => !n.read_at).length;

    async function post(url) {
        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'X-XSRF-TOKEN': getCookie('XSRF-TOKEN'), Accept: 'application/json' },
                credentials: 'same-origin',
            });
        } catch { /* ignore */ }
    }

    async function open(n, e) {
        e.preventDefault();
        if (!n.read_at) await post(`/notifications/${n.id}/read`);
        if (n.url) router.visit(n.url);
        else router.reload({ only: ['notifications'] });
    }

    function markAll() {
        router.post('/notifications/read-all', {}, { preserveScroll: true });
    }

    return (
        <MainLayout>
            <Head title="Notifications" />
            <div className="container" style={{ paddingTop: 32, paddingBottom: 80, maxWidth: 760 }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }} data-reveal>
                    <div>
                        <h1 style={{ marginBottom: 4 }}>Notifications</h1>
                        <p style={{ color: 'var(--text3)', fontSize: 14, margin: 0 }}>
                            {notifications?.total ?? 0} total{unreadCount > 0 ? ` · ${unreadCount} unread on this page` : ''}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button className="btn btn-outline btn-sm pop-on-active" onClick={markAll}>Mark all read</button>
                    )}
                </div>

                {list.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px 16px', color: 'var(--text3)' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
                        <p style={{ margin: 0 }}>No notifications yet. Activity on your answers, jobs and outreach will show up here.</p>
                    </div>
                ) : (
                    <div data-reveal-stagger="45">
                        {list.map(n => (
                            <a
                                key={n.id}
                                href={n.url || '#'}
                                onClick={(e) => open(n, e)}
                                className={`notif-page-item${n.read_at ? '' : ' is-unread'}`}
                                data-reveal="fade"
                            >
                                <span className="notif-icon">{n.icon || '🔔'}</span>
                                <span style={{ flex: 1, minWidth: 0 }}>
                                    <span style={{ display: 'block', fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{n.title}</span>
                                    {n.body && <span style={{ display: 'block', color: 'var(--text3)', fontSize: 13, marginTop: 2 }}>{n.body}</span>}
                                    <span style={{ display: 'block', color: 'var(--text4)', fontSize: 12, marginTop: 4 }}>{timeAgo(n.created_at)}</span>
                                </span>
                                {!n.read_at && <span className="notif-dot" style={{ marginTop: 6 }} />}
                            </a>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {notifications?.last_page > 1 && (
                    <div className="pagination-wrapper" style={{ marginTop: 20 }}>
                        {notifications.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`page-link ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
