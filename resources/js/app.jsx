import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { initReveal, scanReveal } from './lib/reveal';

createInertiaApp({
    title: (title) => title ? `${title} — DevRank` : 'DevRank',
    // Lazy page resolution: each page is its own chunk, fetched on demand
    // (no `eager`), so the initial bundle only carries the shell + first page.
    // Inertia caches resolved components, so back/forward is instant.
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.jsx');
        const importPage = pages[`./Pages/${name}.jsx`];
        if (!importPage) {
            console.error(`Page not found: ./Pages/${name}.jsx`);
            return Promise.reject(new Error(`Page not found: ./Pages/${name}.jsx`));
        }
        return importPage();
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
