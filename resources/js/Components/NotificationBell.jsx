import { useEffect, useRef, useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { getEcho } from '@/lib/echo';

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
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const POLL_MS = 45000;

export default function NotificationBell() {
    const userId = usePage().props?.auth?.user?.id;
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const fetchFeed = useCallback(async () => {
        try {
            const res = await fetch('/notifications/feed', {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (!res.ok) return;
            const data = await res.json();
            setItems(data.items || []);
            setUnread(data.unread || 0);
        } catch { /* offline / transient — ignore */ }
    }, []);

    // Poll on mount + interval; refresh after each Inertia navigation.
    useEffect(() => {
        fetchFeed();
        const id = setInterval(() => {
            if (document.visibilityState === 'visible') fetchFeed();
        }, POLL_MS);
        const off = router.on('finish', () => fetchFeed());
        return () => { clearInterval(id); off(); };
    }, [fetchFeed]);

    // Real-time push (Reverb) — additive to polling. No-op if Reverb isn't
    // configured (getEcho() returns null) or there's no user.
    useEffect(() => {
        if (!userId) return;
        const echo = getEcho();
        if (!echo) return;
        const channel = echo.private(`notifications.${userId}`);
        channel.listen('.notification.created', (n) => {
            setItems(prev => prev.some(x => x.id === n.id) ? prev : [n, ...prev].slice(0, 12));
            setUnread(u => u + 1);
        });
        return () => {
            try { echo.leave(`notifications.${userId}`); } catch { /* ignore */ }
        };
    }, [userId]);

    // Close on outside click
    useEffect(() => {
        function onDoc(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    async function post(url) {
        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'X-XSRF-TOKEN': getCookie('XSRF-TOKEN'), Accept: 'application/json' },
                credentials: 'same-origin',
            });
        } catch { /* ignore */ }
    }

    async function openItem(n) {
        if (!n.read_at) {
            setItems(prev => prev.map(x => x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x));
            setUnread(u => Math.max(0, u - 1));
            await post(`/notifications/${n.id}/read`);
        }
        setOpen(false);
        if (n.url) router.visit(n.url);
    }

    async function markAll() {
        setItems(prev => prev.map(x => ({ ...x, read_at: x.read_at || new Date().toISOString() })));
        setUnread(0);
        await post('/notifications/read-all');
    }

    return (
        <div className="notif" ref={ref}>
            <button
                className="notif-bell"
                onClick={() => setOpen(o => !o)}
                aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
            >
                🔔
                {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
            </button>

            {open && (
                <div className="notif-panel">
                    <div className="notif-head">
                        <span>Notifications</span>
                        {unread > 0 && (
                            <button className="notif-markall" onClick={markAll}>Mark all read</button>
                        )}
                    </div>

                    <div className="notif-list">
                        {items.length === 0 ? (
                            <div className="notif-empty">You’re all caught up 🎉</div>
                        ) : (
                            items.map(n => (
                                <button
                                    key={n.id}
                                    className={`notif-item${n.read_at ? '' : ' is-unread'}`}
                                    onClick={() => openItem(n)}
                                >
                                    <span className="notif-icon">{n.icon || '🔔'}</span>
                                    <span className="notif-body">
                                        <span className="notif-title">{n.title}</span>
                                        {n.body && <span className="notif-sub">{n.body}</span>}
                                        <span className="notif-time">{timeAgo(n.created_at)}</span>
                                    </span>
                                    {!n.read_at && <span className="notif-dot" />}
                                </button>
                            ))
                        )}
                    </div>

                    <a href="/notifications" className="notif-foot" onClick={() => setOpen(false)}>
                        See all notifications
                    </a>
                </div>
            )}
        </div>
    );
}
