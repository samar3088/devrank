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

// Re-arm reveals after every Inertia navigation (new DOM, same document).
router.on('finish', () => {
    requestAnimationFrame(() => scanReveal());
});
