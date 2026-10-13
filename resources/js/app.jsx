import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { initReveal, scanReveal } from './lib/reveal';

createInertiaApp({
    title: (title) => title ? `${title} — DevRank` : 'DevRank',
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const page = pages[`./Pages/${name}.jsx`];
        if (!page) {
            console.error(`Page not found: ./Pages/${name}.jsx`);
            console.error('Available pages:', Object.keys(pages));
        }
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
        initReveal();
    },
});

// Re-arm reveals after every navigation (new DOM, same document).
// IMPORTANT: 'finish' fires for forward visits but NOT for browser back/forward
// (popstate) restores — without re-arming there, [data-reveal] elements stay at
// opacity:0 and the page looks blank. So we also re-arm on Inertia 'navigate'
// (covers history visits) and a native popstate safety net.
function rearmReveals() {
    requestAnimationFrame(() => scanReveal());
}
router.on('finish', rearmReveals);
router.on('navigate', rearmReveals);
if (typeof window !== 'undefined') {
    // Belt-and-suspenders: after a back/forward restore the DOM swap may land a
    // tick later, so scan on the next frame and once more shortly after.
    window.addEventListener('popstate', () => {
        rearmReveals();
        setTimeout(rearmReveals, 120);
    });
}
