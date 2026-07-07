import React, { useState, useRef, useEffect } from 'react';
import { IconSearch, IconX, IconLoader2, IconAlertCircle } from '@tabler/icons-react';
import colors from '../../../../shared/constants/colors.js';

/* ─── Spinner ────────────────────────────────────────────────────── */
const Spinner = ({ size = 16, color = 'currentColor' }) => (
    <IconLoader2 size={size} stroke={2}
        style={{ animation: 'spin 0.7s linear infinite', color, flexShrink: 0 }}
    />
);
// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('tabler-spin-kf')) {
    const s = document.createElement('style');
    s.id = 'tabler-spin-kf';
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
}

/* ─── Buttons ────────────────────────────────────────────────────── */
const PrimaryBtn = ({ onClick, disabled, loading, children, fullWidth = false }) => (
    <button
        onClick={onClick}
        disabled={disabled || loading}
        style={{
            padding: '9px 18px', borderRadius: 10, border: 'none',
            background: disabled || loading
                ? '#e0d0d8'
                : `linear-gradient(135deg, ${colors.primaryButton} 0%, #c0005e 100%)`,
            color: '#fff', fontWeight: 600, fontSize: 13,
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: disabled || loading ? 'none' : '0 3px 10px rgba(122,0,60,0.25)',
            width: fullWidth ? '100%' : 'auto',
            justifyContent: fullWidth ? 'center' : 'flex-start',
            transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
        {loading && <Spinner size={14} />}
        {children}
    </button>
);

const GhostBtn = ({ onClick, disabled, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            padding: '9px 16px', borderRadius: 10,
            border: '1px solid rgba(210,104,104,0.3)',
            background: 'rgba(255,255,255,0.7)', color: colors.primaryText,
            fontWeight: 600, fontSize: 13,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(210,104,104,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; }}
    >
        {children}
    </button>
);

/* ═══════════════════════════════════════════════════════════════════
   AddFriendModal
═══════════════════════════════════════════════════════════════════ */
export function AddFriendModal({ onClose, onAdd }) {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleSubmit = (e) => {
        e?.preventDefault();
        const trimmed = username.trim();
        if (!trimmed) { setError('Vui lòng nhập username'); return; }
        setError('');
        setChecking(true);
        onAdd(trimmed,
            (msg) => { setError(msg); setChecking(false); },
            (v) => setChecking(!!v),
        );
    };

    return (
        <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            background: 'linear-gradient(160deg,#fff7fb 0%,#fff 100%)',
            borderRadius: 'inherit', overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px 12px',
                borderBottom: '1.5px solid rgba(122, 0, 60, 0.25)', flexShrink: 0,
            }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: colors.primaryText }}>
                    Kết bạn bằng username
                </span>
                <button onClick={onClose} disabled={checking} style={{
                    background: 'rgba(122, 0, 60, 0.08)', border: '1.5px solid rgba(122, 0, 60, 0.45)', borderRadius: 8,
                    width: 30, height: 30, cursor: checking ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: colors.primaryText, opacity: checking ? 0.4 : 1,
                    padding: 0, margin: 0,
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} style={{
                padding: 20, display: 'flex', flexDirection: 'column', gap: 14, flex: 1,
            }}>
                {/* Input */}
                <div style={{ position: 'relative' }}>
                    <span style={{
                        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                        color: colors.regularText || '#5b5b5b', display: 'flex', pointerEvents: 'none',
                    }}>
                        <IconSearch size={16} stroke={2} />
                    </span>
                    <input
                        ref={inputRef}
                        value={username}
                        onChange={e => { setUsername(e.target.value); if (error) setError(''); }}
                        placeholder="Nhập username (vd: user1)"
                        disabled={checking}
                        id="add-friend-username-input"
                        style={{
                            width: '100%', boxSizing: 'border-box',
                            padding: '10px 12px 10px 34px',
                            border: `1.5px solid ${error ? '#ef4444' : 'rgba(122, 0, 60, 0.4)'}`,
                            borderRadius: 10, fontSize: 14, outline: 'none',
                            background: checking ? '#fafafa' : '#fff', color: '#111',
                            fontWeight: '600',
                            transition: 'border-color 0.15s',
                        }}
                        onFocus={e => { if (!error) e.target.style.borderColor = colors.cardBorder; }}
                        onBlur={e => { if (!error) e.target.style.borderColor = 'rgba(122, 0, 60, 0.4)'; }}
                    />
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        fontSize: 12, color: '#ef4444', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 5, marginTop: -6,
                    }}>
                        <IconAlertCircle size={14} stroke={2.5} />
                        {error}
                    </div>
                )}

                <p style={{ margin: 0, fontSize: 12, color: colors.regularText || '#5b5b5b', lineHeight: 1.6, fontWeight: 500 }}>
                    Nhập đúng username của người bạn muốn kết bạn. Sau khi xác nhận, bạn có thể gửi kèm lời nhắn.
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 'auto', paddingTop: 8 }}>
                    <GhostBtn onClick={onClose} disabled={checking}>Hủy</GhostBtn>
                    <PrimaryBtn disabled={!username.trim()} loading={checking} onClick={handleSubmit}>
                        {checking ? 'Đang tìm…' : 'Tiếp tục'}
                    </PrimaryBtn>
                </div>
            </form>
        </div>
    );
}

export default AddFriendModal;
