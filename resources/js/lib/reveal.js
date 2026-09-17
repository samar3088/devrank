/**
 * DevRank reveal engine.
 * Reveals [data-reveal] elements as they enter the viewport, and toggles
 * .is-revealed on .bar-grow meters so they animate to their target width.
 *
 * Safety contract (see animations.css):
 *  - Hiding only applies while <html> has .js-reveal, which we add here.
 *    If this script never runs, content stays visible.
 *  - prefers-reduced-motion => reveal everything immediately, no observer.
 *  - Fallback timer reveals anything still hidden after 1.5s, so a missed
 *    observer callback can never strand content at opacity:0.
 */

const REDUCED =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let observer = null;
let fallbackTimer = null;

function revealNow(el) {
    el.classList.add('is-revealed');
}

function ensureObserver() {
    if (observer || typeof IntersectionObserver === 'undefined') return observer;
    observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    revealNow(entry.target);
                    observer.unobserve(entry.target);
                }
            }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    return observer;
}

/**
 * Scan the document for not-yet-revealed reveal targets and observe them.
 * Applies an automatic stagger to direct siblings that share a parent and
 * opt in with [data-reveal-stagger] on the parent.
 */
export function scanReveal() {
    if (typeof document === 'undefined') return;

    // Auto-stagger: parent[data-reveal-stagger] => children get incremental delay.
    document.querySelectorAll('[data-reveal-stagger]').forEach((parent) => {
        if (parent.dataset.staggered === '1') return;
        const step = parseInt(parent.dataset.revealStagger || '70', 10);
        const kids = parent.querySelectorAll(':scope > [data-reveal]');
        kids.forEach((kid, i) => {
            if (!kid.style.getPropertyValue('--reveal-delay')) {
                kid.style.setProperty('--reveal-delay', `${i * step}ms`);
            }
        });
        parent.dataset.staggered = '1';
    });

    const targets = document.querySelectorAll(
        '[data-reveal]:not(.is-revealed), .bar-grow:not(.is-revealed)'
    );

    if (REDUCED) {
        targets.forEach(revealNow);
        return;
    }

    const io = ensureObserver();
    if (!io) {
        targets.forEach(revealNow); // no IO support => just show
        return;
    }
    targets.forEach((el) => io.observe(el));

    // Safety net: never leave anything hidden.
    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(() => {
        document
            .querySelectorAll('[data-reveal]:not(.is-revealed), .bar-grow:not(.is-revealed)')
            .forEach(revealNow);
    }, 1500);
}

/** Arm reveals for the whole app. Call once at boot. */
export function initReveal() {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.add('js-reveal');
    // Run after paint so first-frame elements measure correctly.
    requestAnimationFrame(() => scanReveal());
}
