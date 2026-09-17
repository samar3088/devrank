import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
            '@css': '/resources/css',
        },
    },
    build: {
        rollupOptions: {
            output: {
                // Peel ONLY the genuinely-independent heavy libs into their own
                // cacheable chunks (Recharts loads only on admin analytics; Monaco
                // only on the quiz editor). React/ReactDOM/Inertia MUST stay together
                // in one chunk — fragmenting React's internals breaks its singleton.
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;
                    if (id.includes('monaco-editor')) return 'monaco';
                    if (id.includes('recharts') || id.includes('/d3-') || id.includes('victory-')) return 'charts';
                    // Leave TipTap/ProseMirror unassigned so they stay in the
                    // lazy-loaded RichTextEditor chunk (only the forum editor pulls them).
                    if (id.includes('@tiptap') || id.includes('prosemirror')) return;
                    return 'vendor';
                },
            },
        },
    },
});