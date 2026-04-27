import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Reusable admin filter bar — search + optional select filter.
 * Props: route, filters, selectName, selectOptions, placeholder
 */
export function AdminFilterBar({ route, filters, selectName, selectOptions, placeholder = 'Search...' }) {
    const [search, setSearch] = useState(filters.search || '');

    function submit(e) {
        e.preventDefault();
        router.get(route, { ...filters, search }, { preserveScroll: true });
    }

    function changeSelect(val) {
        router.get(route, { ...filters, [selectName]: val || undefined }, { preserveScroll: true });
    }

    return (
        <form onSubmit={submit} className="admin-filter-bar">
            <input
                type="text"
                className="admin-search-input"
                placeholder={placeholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">Search</button>

            {selectName && selectOptions && (
                <select
                    className="admin-filter-select"
                    value={filters[selectName] || ''}
                    onChange={e => changeSelect(e.target.value)}
                >
                    <option value="">All</option>
                    {selectOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            )}
        </form>
    );
}

/**
 * Pagination links for admin tables.
 */
export function AdminPagination({ data }) {
    if (data.last_page <= 1) return null;

    return (
        <div className="admin-pagination">
            <span>{data.from}–{data.to} of {data.total}</span>
            <div className="admin-pagination-links">
                {data.links.map((link, i) => link.url ? (
                    <Link
                        key={i}
                        href={link.url}
                        className={`admin-action-btn${link.active ? ' amber' : ''}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={i}
                        className="admin-action-btn"
                        style={{ opacity: 0.35, cursor: 'default' }}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Status badge helper.
 */
export function AdminBadge({ value, map }) {
    const { label, cls } = map[value] || { label: value, cls: 'gray' };
    return <span className={`admin-badge admin-badge-${cls}`}>{label}</span>;
}

/**
 * Format date helper.
 */
export function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
