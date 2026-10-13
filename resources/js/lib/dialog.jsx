// Portal-styled dialogs (confirm / prompt / toast) replacing the browser's
// native window.confirm / window.prompt / alert — so every dialog matches the
// DevRank dark theme. Imperative API returning Promises, mounted in its own
// React root on <body>, usable from any call site:
//
//   const ok = await confirmDialog('Delete this?', { danger: true });
//   const name = await promptDialog('Name this search', 'My search'); // string | null
//   toast('Saved!', 'success');
//
// Reduced-motion-safe (CSS handles the fade); no external deps.

import { createRoot } from 'react-dom/client';
import { useEffect, useRef, useState } from 'react';

let _dispatch = null;
const _pending = [];
let _seq = 0;

function ensureHost() {
    if (_dispatch || typeof document === 'undefined') return;
    let el = document.getElementById('dr-dialog-root');
    if (!el) {
        el = document.createElement('div');
        el.id = 'dr-dialog-root';
        document.body.appendChild(el);
    }
    createRoot(el).render(
        <DialogHost register={(fn) => { _dispatch = fn; _pending.forEach(fn); _pending.length = 0; }} />
    );
}

function request(item) {
    return new Promise((resolve) => {
        const full = { id: ++_seq, resolve, ...item };
        ensureHost();
        if (_dispatch) _dispatch(full); else _pending.push(full);
    });
}

export function confirmDialog(message, opts = {}) {
    return request({ kind: 'confirm', message, ...opts });
}

export function promptDialog(message, defaultValue = '', opts = {}) {
    return request({ kind: 'prompt', message, defaultValue, ...opts });
}

export function toast(message, variant = 'success', opts = {}) {
    return request({ kind: 'toast', message, variant, ...opts });
}

function DialogHost({ register }) {
    const [modal, setModal] = useState(null);
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        register((item) => {
            if (item.kind === 'toast') {
                setToasts((list) => [...list, item]);
                const ttl = item.duration ?? 3800;
                setTimeout(() => {
                    setToasts((list) => list.filter((t) => t.id !== item.id));
                    item.resolve?.();
                }, ttl);
            } else {
                // One modal at a time; a new request supersedes (cancels) any open one.
                setModal((prev) => { prev?.resolve?.(prev.kind === 'prompt' ? null : false); return item; });
            }
        });
    }, [register]);

    function close(result) {
        setModal((m) => { m?.resolve?.(result); return null; });
    }

    return (
        <>
            {modal && <Modal key={modal.id} item={modal} onClose={close} />}
            {toasts.length > 0 && (
                <div className="dr-toast-wrap" role="region" aria-live="polite">
                    {toasts.map((t) => (
                        <div key={t.id} className={`dr-toast dr-toast-${t.variant || 'success'}`}>
                            <span className="dr-toast-icon">
                                {t.variant === 'error' ? '⚠' : t.variant === 'info' ? 'ℹ' : '✓'}
                            </span>
                            <span>{t.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

function Modal({ item, onClose }) {
    const isPrompt = item.kind === 'prompt';
    const [value, setValue] = useState(item.defaultValue || '');
    const inputRef = useRef(null);
    const confirmRef = useRef(null);

    useEffect(() => {
        // Focus the input (prompt) or the primary button (confirm) on open.
        const t = setTimeout(() => {
            if (isPrompt && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
            else confirmRef.current?.focus();
        }, 20);
        function onKey(e) {
            if (e.key === 'Escape') { e.preventDefault(); onClose(isPrompt ? null : false); }
            if (e.key === 'Enter' && !isPrompt) { e.preventDefault(); onClose(true); }
        }
        document.addEventListener('keydown', onKey);
        return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); };
    }, [isPrompt, onClose]);

    function submitPrompt(e) {
        e.preventDefault();
        onClose(value);
    }

    const title = item.title || (isPrompt ? 'Enter a value' : 'Please confirm');
    const confirmText = item.confirmText || (isPrompt ? 'Save' : 'Confirm');
    const cancelText = item.cancelText || 'Cancel';

    return (
        <div className="dr-dialog-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(isPrompt ? null : false); }}>
            <div className="dr-dialog" role="dialog" aria-modal="true" aria-label={title}>
                <div className="dr-dialog-title">{title}</div>
                {item.message && <div className="dr-dialog-msg">{item.message}</div>}
                {isPrompt && (
                    <form onSubmit={submitPrompt}>
                        <input
                            ref={inputRef}
                            className="dr-dialog-input"
                            type="text"
                            value={value}
                            placeholder={item.placeholder || ''}
                            onChange={(e) => setValue(e.target.value)}
                        />
                    </form>
                )}
                <div className="dr-dialog-actions">
                    <button type="button" className="dr-dialog-btn dr-dialog-cancel" onClick={() => onClose(isPrompt ? null : false)}>
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        ref={confirmRef}
                        className={`dr-dialog-btn ${item.danger ? 'dr-dialog-danger' : 'dr-dialog-confirm'}`}
                        onClick={() => onClose(isPrompt ? value : true)}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
