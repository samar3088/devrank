import { useEffect, useRef, useState } from 'react';

/**
 * Searchable multi-select dropdown. Theme-matched, keyboard + click-outside aware.
 *
 *   <MultiSelect
 *     options={[{ value, label }]}
 *     selected={[value, …]}
 *     onChange={(nextArray) => …}
 *     placeholder="All skills"
 *     searchPlaceholder="Filter skills…"
 *   />
 */
export default function MultiSelect({
    options = [],
    selected = [],
    onChange,
    placeholder = 'Select…',
    searchPlaceholder = 'Filter…',
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapRef = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => {
        function onDocClick(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        }
        function onKey(e) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('mousedown', onDocClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    useEffect(() => {
        if (open) setTimeout(() => searchRef.current?.focus(), 20);
        else setQuery('');
    }, [open]);

    const filtered = options.filter(o =>
        o.label.toLowerCase().includes(query.trim().toLowerCase())
    );

    function toggle(value) {
        const next = selected.includes(value)
            ? selected.filter(v => v !== value)
            : [...selected, value];
        onChange?.(next);
    }

    const count = selected.length;
    const labelText = count === 0
        ? placeholder
        : count === 1
            ? (options.find(o => o.value === selected[0])?.label || `1 selected`)
            : `${count} skills selected`;

    return (
        <div className="ms-wrap" ref={wrapRef}>
            <button
                type="button"
                className={`ms-toggle ${count > 0 ? 'has-value' : ''}`}
                onClick={() => setOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="ms-toggle-label">{labelText}</span>
                <span className="ms-caret">▾</span>
            </button>

            {open && (
                <div className="ms-panel" role="listbox">
                    <input
                        ref={searchRef}
                        type="text"
                        className="ms-search"
                        placeholder={searchPlaceholder}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <div className="ms-options">
                        {filtered.length === 0 && <div className="ms-empty">No matches</div>}
                        {filtered.map(o => (
                            <label key={o.value} className="ms-option">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(o.value)}
                                    onChange={() => toggle(o.value)}
                                />
                                <span>{o.label}</span>
                            </label>
                        ))}
                    </div>
                    {count > 0 && (
                        <button type="button" className="ms-clear" onClick={() => onChange?.([])}>
                            Clear selection
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
