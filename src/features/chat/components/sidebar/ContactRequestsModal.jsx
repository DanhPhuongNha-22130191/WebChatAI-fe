import React, { useState, useEffect } from 'react';
import {
    IconCheck, IconX, IconLoader2, IconBellOff,
} from '@tabler/icons-react';
import { usePendingActions } from '../../hooks/usePendingActions';
import colors from '../../../../shared/constants/colors';
import { getAvatarUrl } from '../../../../shared/utils/avatarUtils.js';

/* ─── Spinner ────────────────────────────────────────────────────── */
const Spinner = ({ size = 14, color = 'currentColor' }) => (
    <IconLoader2 size={size} stroke={2}
        style={{ animation: 'spin 0.7s linear infinite', color, flexShrink: 0 }}
    />
);

/* ─── ContactRequestsModal ───────────────────────────────────────── */
const ContactRequestsModal = ({ onClose, onSelectUser }) => {
    const { pendingContacts, fetchIncomingRequests, acceptContact, rejectContact } = usePendingActions();
    const [pageLoading, setPageLoading] = useState(true);
    const [actionState, setActionState] = useState({}); // { [username]: 'accepting'|'rejecting'|'done' }

    useEffect(() => {
        (async () => {
            try { await fetchIncomingRequests(); }
            catch { /* handled in usecase */ }
            finally { setPageLoading(false); }
        })();
    }, [fetchIncomingRequests]);

    const handleAccept = async (username, e) => {
        e.stopPropagation();
        setActionState(s => ({ ...s, [username]: 'accepting' }));
        try {
            await acceptContact(username);
            setActionState(s => ({ ...s, [username]: 'done' }));
            setTimeout(() => { onSelectUser?.(username); onClose(); }, 380);
        } catch {
            setActionState(s => { const n = { ...s }; delete n[username]; return n; });
        }
    };

    const handleReject = async (username, e) => {
        e.stopPropagation();
        setActionState(s => ({ ...s, [username]: 'rejecting' }));
        try {
            await rejectContact(username);
            setActionState(s => ({ ...s, [username]: 'done' }));
        } catch {
            setActionState(s => { const n = { ...s }; delete n[username]; return n; });
        }
    };

    const visible = pendingContacts.filter(c => actionState[c.username || c.name] !== 'done');

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: colors.primaryText }}>
                        Lời mời kết bạn
                    </span>
                    {!pageLoading && visible.length > 0 && (
                        <span style={{
                            background: `linear-gradient(135deg,${colors.primaryButton},#c0005e)`,
                            color: '#fff', fontSize: 11, fontWeight: 700,
                            borderRadius: 99, padding: '1px 7px',
                        }}>
                            {visible.length}
                        </span>
                    )}
                </div>
                <button onClick={onClose} style={{
                    background: 'rgba(122, 0, 60, 0.08)', border: '1.5px solid rgba(122, 0, 60, 0.45)', borderRadius: 8,
                    width: 30, height: 30, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: colors.primaryText, padding: 0, margin: 0,
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 0' }}>
                {pageLoading ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12,
                    }}>
                        <Spinner size={26} color={colors.primaryButton} />
                        <span style={{ fontSize: 13, color: colors.regularText || '#5b5b5b', fontWeight: 600 }}>Đang tải...</span>
                    </div>

                ) : visible.length === 0 ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10,
                    }}>
                        <IconBellOff size={36} stroke={2} style={{ color: colors.primaryText, opacity: 0.6 }} />
                        <span style={{ fontSize: 14, color: colors.regularText || '#5b5b5b', fontWeight: 600 }}>
                            Không có lời mời nào
                        </span>
                    </div>

                ) : visible.map((contact) => {
                    const contactName = contact.username || contact.name || 'Unknown';
                    const state = actionState[contactName];
                    const busy = !!state;

                    return (
                        <div
                            key={contactName}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 16px',
                                borderBottom: '1px solid rgba(122, 0, 60, 0.15)',
                                opacity: busy ? 0.65 : 1,
                                transition: 'background 0.15s, opacity 0.2s',
                            }}
                            onMouseEnter={e => { if (!busy) e.currentTarget.style.background = 'rgba(122, 0, 60, 0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            {/* Avatar */}
                            <img
                                src={getAvatarUrl(contactName, 80)}
                                alt={contactName}
                                style={{
                                    width: 42, height: 42, borderRadius: '50%',
                                    objectFit: 'cover', flexShrink: 0,
                                    border: '2px solid rgba(122, 0, 60, 0.25)',
                                }}
                            />

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: 14, fontWeight: 700, color: colors.primaryText,
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                    {contactName}
                                </div>
                                <div style={{ fontSize: 12, color: colors.regularText || '#5b5b5b', marginTop: 2, fontWeight: 500 }}>
                                    Muốn kết bạn với bạn
                                </div>
                            </div>

                            {/* Accept / Reject */}
                            <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                                <button
                                    disabled={busy}
                                    onClick={e => handleAccept(contactName, e)}
                                    title="Chấp nhận"
                                    style={{
                                        width: 32, height: 32, borderRadius: 10, border: 'none',
                                        background: state === 'accepting'
                                            ? '#d1fae5'
                                            : 'linear-gradient(135deg,#22c55e,#16a34a)',
                                        color: state === 'accepting' ? '#16a34a' : '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: busy ? 'not-allowed' : 'pointer',
                                        boxShadow: busy ? 'none' : '0 2px 8px rgba(34,197,94,0.28)',
                                        transition: 'all 0.15s', flexShrink: 0,
                                        padding: 0, margin: 0,
                                    }}
                                >
                                    {state === 'accepting'
                                        ? <Spinner size={14} color="#16a34a" />
                                        : <IconCheck size={16} stroke={2.5} />}
                                </button>

                                <button
                                    disabled={busy}
                                    onClick={e => handleReject(contactName, e)}
                                    title="Từ chối"
                                    style={{
                                        width: 32, height: 32, borderRadius: 10,
                                        border: '1.5px solid #ef4444',
                                        background: state === 'rejecting' ? '#fee2e2' : '#fff',
                                        color: '#ef4444',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: busy ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.15s', flexShrink: 0,
                                        padding: 0, margin: 0,
                                    }}
                                    onMouseEnter={e => { if (!busy) { e.currentTarget.style.background = '#fee2e2'; } }}
                                    onMouseLeave={e => { if (!busy) { e.currentTarget.style.background = '#fff'; } }}
                                >
                                    {state === 'rejecting'
                                        ? <Spinner size={14} color="#ef4444" />
                                        : <IconX size={15} stroke={2.5} />}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ContactRequestsModal;
