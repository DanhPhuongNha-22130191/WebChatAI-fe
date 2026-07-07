import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IconBell,
    IconUserPlus,
    IconShieldFilled,
    IconPlus,
} from '@tabler/icons-react';
import colors from '../../../../shared/constants/colors.js';
import { getAvatarUrl, getDisplayName } from '../../../../shared/utils/avatarUtils.js';

const getUsername = (user) => user?.username || user?.user || user?.name || '';

/* ── Shared icon button ─────────────────────────────────────────────── */
const IconBtn = ({ onClick, title, id, children, extraStyle = {} }) => (
    <button
        onClick={onClick}
        title={title}
        id={id}
        style={{
            width: 32, height: 32, minWidth: 32, minHeight: 32,
            borderRadius: 10,
            border: '1px solid rgba(210,104,104,0.22)',
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, margin: 0,
            transition: 'background 0.15s, border-color 0.15s, transform 0.12s',
            color: colors.primaryText,
            position: 'relative',
            flexShrink: 0,
            ...extraStyle,
        }}
        onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.88)';
            e.currentTarget.style.borderColor = colors.cardBorder;
            e.currentTarget.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.background = extraStyle.background ?? 'rgba(255,255,255,0.55)';
            e.currentTarget.style.borderColor = extraStyle.border ?? 'rgba(210,104,104,0.22)';
            e.currentTarget.style.transform = 'scale(1)';
        }}
    >
        {children}
    </button>
);

/* ── Component ───────────────────────────────────────────────────────── */
const UserHeader = ({
    name,
    user,
    onProfile,
    onAdd,
    onContactRequests,
    onAddFriend,
    pendingContactCount = 0
}) => {
    const navigate = useNavigate();
    const username = getUsername(user);
    const displayName = getDisplayName(user || name);

    const isAdmin = user && (
        user.role === 'ADMIN' ||
        user.role === 'ROLE_ADMIN' ||
        user.username === 'admin' ||
        user.user === 'admin' ||
        user.name === 'admin'
    );

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            color: colors.primaryText,
            fontWeight: 700,
            flexShrink: 0,
            gap: 8,
        }}>
            {/* Avatar + Name */}
            <button
                type="button"
                onClick={() => onProfile?.({ ...user, name: username || name, username })}
                title="Quản lý thông tin cá nhân"
                style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    minWidth: 0, flex: 1,
                    border: 'none', background: 'transparent',
                    cursor: 'pointer', color: colors.primaryText,
                    padding: 0, textAlign: 'left',
                }}
            >
                <img
                    src={getAvatarUrl(displayName, 40, user?.avatar)}
                    alt={displayName}
                    style={{
                        width: 38, height: 38, borderRadius: '50%',
                        objectFit: 'cover', border: `2px solid ${colors.cardBorder || '#fff'}`,
                        flexShrink: 0,
                    }}
                />
                <span style={{
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', fontSize: 14, fontWeight: 700,
                }}>
                    {displayName || name}
                </span>
            </button>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

                {/* Yêu cầu liên hệ */}
                {onContactRequests && (
                    <IconBtn onClick={onContactRequests} title="Yêu cầu liên hệ">
                        <IconBell size={17} stroke={1.8} />
                        {pendingContactCount > 0 && (
                            <span style={{
                                position: 'absolute', top: -3, right: -3,
                                minWidth: 15, height: 15,
                                borderRadius: 99,
                                background: '#ef4444',
                                color: '#fff', fontSize: 9, fontWeight: 800,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                lineHeight: 1, padding: '0 3px',
                                border: '1.5px solid #fff',
                            }}>
                                {pendingContactCount}
                            </span>
                        )}
                    </IconBtn>
                )}

                {/* Kết bạn */}
                {onAddFriend && (
                    <IconBtn onClick={onAddFriend} title="Kết bạn bằng username" id="add-friend-btn">
                        <IconUserPlus size={17} stroke={1.8} />
                    </IconBtn>
                )}

                {/* Admin Panel */}
                {isAdmin && (
                    <IconBtn
                        id="go-to-admin-btn"
                        onClick={() => navigate('/admin')}
                        title="Vào Admin Panel"
                        extraStyle={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: '1px solid #6366f1',
                            color: '#fff',
                            boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                        }}
                    >
                        <IconShieldFilled size={16} />
                    </IconBtn>
                )}

                {/* Tạo phòng */}
                <IconBtn onClick={onAdd} title="Tạo phòng chat mới">
                    <IconPlus size={18} stroke={2} />
                </IconBtn>
            </div>
        </div>
    );
};

export default UserHeader;
