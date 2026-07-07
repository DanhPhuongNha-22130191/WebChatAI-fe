import React from 'react';
import { useNavigate } from 'react-router-dom';
import colors from '../../../../shared/constants/colors.js';
import Button from '../../../../shared/components/Button';
import { getAvatarUrl, getDisplayName } from '../../../../shared/utils/avatarUtils.js';

const getUsername = (user) => user?.username || user?.user || user?.name || '';

const UserHeader = ({
    name,
    user,
    onProfile,
    onAdd,
    onContactRequests,
    pendingContactCount = 0
}) => {
    const navigate = useNavigate();
    const username = getUsername(user);
    const displayName = getDisplayName(user || name);

    // Kiểm tra quyền admin
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
            padding: 16,
            color: colors.primaryText,
            fontWeight: 700,
            flexShrink: 0,
            gap: 12
        }}>
            <button
                type="button"
                onClick={() => onProfile?.({ ...user, name: username || name, username })}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    minWidth: 0,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: colors.primaryText,
                    padding: 0,
                    textAlign: 'left'
                }}
                title="Quản lý thông tin cá nhân"
            >
                <img
                    src={getAvatarUrl(displayName, 40, user?.avatar)}
                    alt={displayName}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `2px solid ${colors.cardBorder || '#fff'}`,
                        flexShrink: 0
                    }}
                />
                <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 150
                }}>
                    {displayName || name}
                </span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {onContactRequests && (
                    <Button
                        onClick={onContactRequests}
                        style={{
                            width: 'auto',
                            minWidth: '120px',
                            padding: '8px 16px',
                            backgroundColor: colors.primaryButton,
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            position: 'relative'
                        }}
                    >
                        Yêu cầu liên hệ

                        {pendingContactCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                minWidth: 18,
                                height: 18,
                                padding: '0 5px',
                                borderRadius: 999,
                                backgroundColor: 'red',
                                color: 'white',
                                fontSize: 12,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: '18px'
                            }}>
                                {pendingContactCount}
                            </span>
                        )}
                    </Button>
                )}

                {/* Nút Admin Panel — chỉ hiện với admin */}
                {isAdmin && (
                    <button
                        id="go-to-admin-btn"
                        onClick={() => navigate('/admin')}
                        title="Vào Admin Panel"
                        style={{
                            borderRadius: '50%',
                            border: `1px solid #6366f1`,
                            width: 28,
                            height: 28,
                            minWidth: 28,
                            minHeight: 28,
                            padding: 0,
                            margin: 0,
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            lineHeight: 1,
                            aspectRatio: '1 / 1',
                            boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.55)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.4)'; }}
                    >
                        🛡️
                    </button>
                )}

                <button onClick={onAdd} style={{
                    borderRadius: '50%',
                    border: `1px solid ${colors.cardBorder}`,
                    width: 28,
                    height: 28,
                    minWidth: 28,
                    minHeight: 28,
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.primaryText,
                    fontSize: 18,
                    lineHeight: 1,
                    aspectRatio: '1 / 1'
                }}>+</button>
            </div>
        </div>
    );
};

export default UserHeader;
