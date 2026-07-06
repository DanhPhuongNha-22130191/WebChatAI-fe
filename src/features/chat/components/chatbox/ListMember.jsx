import React, { useEffect, useMemo, useRef, useState } from 'react';
import colors from '../../../../shared/constants/colors.js';
import AddMember from './AddMember.jsx';
import { getAvatarUrl } from '../../../../shared/utils/avatarUtils.js';

const ROLE = {
    OWNER: 'OWNER',
    DEPUTY: 'DEPUTY',
    MEMBER: 'MEMBER'
};

const normalizeRole = (role) => {
    const value = String(role || '').toUpperCase();

    if (value === ROLE.OWNER || value === ROLE.DEPUTY || value === ROLE.MEMBER) {
        return value;
    }

    return ROLE.MEMBER;
};

const getMemberUsername = (member) => {
    if (typeof member === 'string') return member;
    return member?.username || member?.user || member?.name || '';
};

const getMemberDisplayName = (member) => {
    if (typeof member === 'string') return member;
    return member?.displayName || member?.name || member?.username || '';
};

const getMemberRole = (member) => {
  if (typeof member === "string") return ROLE.MEMBER;

  const role = String(member?.role || "").toUpperCase();

  // Ưu tiên role thật từ database
  if (role === ROLE.OWNER) return ROLE.OWNER;
  if (role === ROLE.DEPUTY) return ROLE.DEPUTY;

  // Fallback nếu dữ liệu cũ còn cờ quyền
  if (member?.isOwner === true || member?.own === true) return ROLE.OWNER;
  if (member?.isDeputy === true) return ROLE.DEPUTY;

  return ROLE.MEMBER;
};

const roleLabel = {
    [ROLE.OWNER]: 'Trưởng nhóm',
    [ROLE.DEPUTY]: 'Phó nhóm',
    [ROLE.MEMBER]: 'Thành viên'
};

const roleStyle = {
    [ROLE.OWNER]: {
        color: '#b51c61',
        background: '#fff0f7',
        border: '1px solid #ffc7df'
    },
    [ROLE.DEPUTY]: {
        color: '#7c3aed',
        background: '#f4efff',
        border: '1px solid #ddd0ff'
    },
    [ROLE.MEMBER]: {
        color: '#71717a',
        background: '#f6f6f7',
        border: '1px solid #ececef'
    }
};

const MenuItem = ({ children, onClick, danger = false }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            width: '100%',
            border: 0,
            background: 'transparent',
            padding: '9px 12px',
            textAlign: 'left',
            cursor: 'pointer',
            color: danger ? '#dc2626' : '#3f3f46',
            fontSize: 13.5,
            fontWeight: 600,
            borderRadius: 8,
            outline: 'none'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = danger ? '#fff1f2' : '#fff5f9';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
        }}
    >
        {children}
    </button>
);

const ListMember = ({
    members = [],
    isGroup = false,
    currentUsername = '',
    currentUserRole = ROLE.MEMBER,
    onAddMember,
    onPromoteDeputy,
    onDemoteDeputy,
    onRemoveMember,
    onClose
}) => {
    const [openMenuUser, setOpenMenuUser] = useState(null);
const containerRef = useRef(null);
    const normalizedCurrentRole = normalizeRole(currentUserRole);
    const currentIsOwner = normalizedCurrentRole === ROLE.OWNER;
    const currentIsDeputy = normalizedCurrentRole === ROLE.DEPUTY;
    const currentCanManage = currentIsOwner || currentIsDeputy;

    const normalizedMembers = useMemo(() => {
        return members.map((member) => {
            const username = getMemberUsername(member);
            const role = getMemberRole(member);
            const displayName = getMemberDisplayName(member);

            return {
                ...((typeof member === 'object' && member) ? member : {}),
                username,
                name: username,
                displayName,
                role,
                isOwner: role === ROLE.OWNER,
                isDeputy: role === ROLE.DEPUTY,
                isOnline: typeof member === 'object' ? !!member.isOnline : false,
                avatar: typeof member === 'object' ? member.avatar : null
            };
        });
    }, [members]);

    const canShowMenuFor = (member) => {
        if (!isGroup || !currentCanManage) return false;
        if (!member?.username || member.username === currentUsername) return false;
        if (member.role === ROLE.OWNER) return false;

        if (currentIsOwner) return true;
        if (currentIsDeputy) return member.role === ROLE.MEMBER;

        return false;
    };

    useEffect(() => {
    if (!openMenuUser) return;

    const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
            setOpenMenuUser(null);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [openMenuUser]);

const closeMenu = () => setOpenMenuUser(null);

    const handleMenuAction = (callback, member) => {
        closeMenu();
        callback?.(member);
    };

    return (
    <div
        ref={containerRef}
        onClick={closeMenu}
        style={{
            height: '100%',
            backgroundColor: 'transparent',
            display: 'flex',
            flexDirection: 'column'
        }}
    >
            <div style={{
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                backgroundColor: 'transparent',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                zIndex: 10,
                position: 'relative'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 4,
                            borderRadius: '50%',
                            outline: 'none'
                        }}
                    >
                        ←
                    </button>

                    <span style={{ fontSize: 17, fontWeight: 700, color: colors.primaryText }}>
                        Thành viên ({normalizedMembers.length})
                    </span>
                </div>
            </div>

            <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {isGroup && typeof onAddMember === 'function' && (
    <div style={{ marginBottom: 4 }}>
        <AddMember onClick={onAddMember} />
    </div>
)}

                    {normalizedMembers.map((member) => {
                        const canOpenMenu = canShowMenuFor(member);
                        const isMenuOpen = openMenuUser === member.username;

                        return (
                            <div
                                key={member.username}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 8,
                                    padding: '8px 12px',
                                    borderRadius: 12,
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E0E0E0',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                                    <img
                                        src={getAvatarUrl(member.displayName || member.username, 128, member.avatar)}
                                        alt={member.displayName || member.username}
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            flexShrink: 0
                                        }}
                                    />

                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: 4 }}>
                                        <strong style={{
                                            fontSize: 15,
                                            color: '#333',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {member.displayName || member.username}
                                            {member.username === currentUsername ? ' (Bạn)' : ''}
                                        </strong>

                                        <span style={{
                                            width: 'fit-content',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            padding: '2px 7px',
                                            borderRadius: 999,
                                            ...roleStyle[member.role]
                                        }}>
                                            {roleLabel[member.role]}
                                        </span>
                                    </div>
                                </div>

                                {canOpenMenu && (
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setOpenMenuUser(isMenuOpen ? null : member.username);
                                        }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: 20,
                                            color: '#888',
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            outline: 'none'
                                        }}
                                    >
                                        ⋮
                                    </button>
                                )}

                                {isMenuOpen && canOpenMenu && (
                                    <div
                                        onClick={(event) => event.stopPropagation()}
                                        style={{
                                            position: 'absolute',
                                            right: 10,
                                            top: 42,
                                            width: 168,
                                            padding: 6,
                                            background: '#fff',
                                            border: '1px solid #f2cddd',
                                            borderRadius: 12,
                                            boxShadow: '0 16px 34px rgba(90, 24, 68, 0.18)',
                                            zIndex: 50
                                        }}
                                    >
                                        {currentIsOwner && member.role === ROLE.MEMBER && (
                                            <MenuItem onClick={() => handleMenuAction(onPromoteDeputy, member)}>
                                                Cấp phó nhóm
                                            </MenuItem>
                                        )}

                                        {currentIsOwner && member.role === ROLE.DEPUTY && (
                                            <MenuItem onClick={() => handleMenuAction(onDemoteDeputy, member)}>
                                                Hủy phó nhóm
                                            </MenuItem>
                                        )}

                                        {(currentIsOwner || (currentIsDeputy && member.role === ROLE.MEMBER)) && (
                                            <MenuItem danger onClick={() => handleMenuAction(onRemoveMember, member)}>
                                                Xóa khỏi nhóm
                                            </MenuItem>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ListMember;