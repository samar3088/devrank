// Guarded Laravel Echo (Reverb) singleton. Returns null when Reverb isn't
// configured (no VITE_REVERB_APP_KEY) — the notification bell then relies on its
// 45s polling, so nothing breaks. Real-time is a pure enhancement on top.
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echo;

function xsrf() {
    const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : '';
}

export function getEcho() {
    if (echo !== undefined) return echo; // cached (may be null)

    const key = import.meta.env.VITE_REVERB_APP_KEY;
    if (!key) { echo = null; return echo; }

    try {
        window.Pusher = Pusher;
        echo = new Echo({
            broadcaster: 'reverb',
            key,
            wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
            wsPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
            wssPort: Number(import.meta.env.VITE_REVERB_PORT || 443),
            forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: '/broadcasting/auth',
            auth: { headers: { 'X-XSRF-TOKEN': xsrf() } },
        });
    } catch (e) {
        echo = null;
    }
    return echo;
}
