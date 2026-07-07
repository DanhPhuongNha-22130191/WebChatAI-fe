import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { IconX, IconSend, IconLoader2 } from '@tabler/icons-react';
import colors from '../../../../shared/constants/colors';
import { getAvatarUrl } from '../../../../shared/utils/avatarUtils.js';

const Spinner = ({ size = 14 }) => (
    <IconLoader2 size={size} stroke={2}
        style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}
    />
);

const ContactRequestModal = ({ recipientName, onClose, onSend }) => {
    const currentUser = useSelector((s) => s.auth.user);
    const currentUserName =
        currentUser?.name || currentUser?.user || currentUser?.username ||
        localStorage.getItem('user_name') || 'bạn';

    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        setMessage(`Xin chào ${recipientName}, mình là ${currentUserName}. Kết bạn với mình nhé!`);
        setTimeout(() => textareaRef.current?.focus(), 80);
    }, [recipientName, currentUserName]);

    const handleSend = async () => {
        if (!message.trim() || isSending) return;
        setIsSending(true);
        try { await onSend(recipientName, message.trim()); }
        finally { setIsSending(false); }
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
                    Gửi lời mời kết bạn
                </span>
                <button onClick={onClose} disabled={isSending} style={{
                    background: 'rgba(122, 0, 60, 0.08)', border: '1.5px solid rgba(122, 0, 60, 0.45)', borderRadius: 8,
                    width: 30, height: 30, cursor: isSending ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: colors.primaryText, opacity: isSending ? 0.4 : 1,
                    padding: 0, margin: 0,
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            {/* Recipient card */}
            <div style={{ padding: '14px 16px 0' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px',
                    background: 'rgba(122, 0, 60, 0.06)',
                    border: '1.5px solid rgba(122, 0, 60, 0.25)',
                    borderRadius: 12,
                }}>
                    <img
                        src={getAvatarUrl(recipientName, 80)}
                        alt={recipientName}
                        style={{
                            width: 40, height: 40, borderRadius: '50%',
                            objectFit: 'cover', flexShrink: 0,
                            border: '2px solid rgba(122, 0, 60, 0.3)',
                        }}
                    />
                    <div>
                        <div style={{ fontSize: 12, color: colors.regularText || '#5b5b5b', marginBottom: 2, fontWeight: 500 }}>Gửi đến</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: colors.primaryText }}>
                            @{recipientName}
                        </div>
                    </div>
                </div>
            </div>

            {/* Textarea */}
            <div style={{
                padding: '12px 16px', flex: 1, minHeight: 0,
                display: 'flex', flexDirection: 'column',
            }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: colors.regularText || '#5b5b5b', marginBottom: 6, display: 'block' }}>
                    Lời nhắn kèm theo
                </label>
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSend(); } }}
                    placeholder="Nhập lời nhắn..."
                    disabled={isSending}
                    style={{
                        flex: 1, width: '100%', boxSizing: 'border-box', minHeight: 90,
                        padding: '10px 12px',
                        border: '1.5px solid rgba(122, 0, 60, 0.35)',
                        borderRadius: 10, outline: 'none', resize: 'none',
                        fontSize: 14, lineHeight: 1.55, fontFamily: 'inherit',
                        color: '#111', fontWeight: '500', background: isSending ? '#fafafa' : '#fff',
                        transition: 'border-color 0.15s',
                    }}
                    onFocus={e => { e.target.style.borderColor = colors.cardBorder; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(122, 0, 60, 0.35)'; }}
                />
                <div style={{ fontSize: 11, color: colors.regularText || '#5b5b5b', marginTop: 4, textAlign: 'right', fontWeight: 500 }}>
                    Ctrl + Enter để gửi nhanh
                </div>
            </div>

            {/* Send button */}
            <div style={{ padding: '0 16px 16px', flexShrink: 0 }}>
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                    style={{
                        width: '100%', padding: '11px 0',
                        borderRadius: 12, border: 'none',
                        background: !message.trim() || isSending
                            ? '#e0d0d8'
                            : `linear-gradient(135deg,${colors.primaryButton} 0%,#c0005e 100%)`,
                        color: '#fff', fontWeight: 700, fontSize: 14,
                        cursor: !message.trim() || isSending ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: !message.trim() || isSending ? 'none' : '0 4px 14px rgba(122,0,60,0.28)',
                        transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => { if (message.trim() && !isSending) e.currentTarget.style.opacity = '0.88'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                    {isSending ? <><Spinner size={15} /> Đang gửi...</> : <><IconSend size={15} stroke={2} /> Gửi lời mời kết bạn</>}
                </button>
            </div>
        </div>
    );
};

export default ContactRequestModal;
