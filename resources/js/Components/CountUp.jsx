import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 to `end` when it first scrolls into view.
 * Respects prefers-reduced-motion (renders the final value immediately).
 *
 * Props:
 *   end        target number (required)
 *   duration   ms (default 1400)
 *   decimals   fixed decimal places (default 0)
 *   prefix / suffix   strings wrapped around the number
 *   separator  thousands separator (default ',')
 */
export default function CountUp({
    end,
    duration = 1400,
    decimals = 0,
    prefix = '',
    suffix = '',
    separator = ',',
    className = '',
}) {
    const target = Number(end) || 0;
    const ref = useRef(null);
    const [val, setVal] = useState(0);
    const started = useRef(false);

    const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    useEffect(() => {
        if (started.current) return;
        const node = ref.current;
        if (!node) return;

        if (reduced || typeof IntersectionObserver === 'undefined') {
            setVal(target);
            started.current = true;
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !started.current) {
                        started.current = true;
                        io.disconnect();
                        const t0 = performance.now();
                        const tick = (now) => {
                            const p = Math.min((now - t0) / duration, 1);
                            // easeOutExpo
                            const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
                            setVal(target * eased);
                            if (p < 1) requestAnimationFrame(tick);
                            else setVal(target);
                        };
                        requestAnimationFrame(tick);
                    }
                });
            },
            { threshold: 0.3 }
        );
        io.observe(node);
        return () => io.disconnect();
    }, [target, duration, reduced]);

    const fixed = val.toFixed(decimals);
    const [intPart, decPart] = fixed.split('.');
    const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    const display = decPart != null ? `${withSep}.${decPart}` : withSep;

    return (
        <span ref={ref} className={`tabnum ${className}`}>
            {prefix}
            {display}
            {suffix}
        </span>
    );
}
