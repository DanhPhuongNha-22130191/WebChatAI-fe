import React from 'react';
import colors from '../../../../shared/constants/colors.js';
import { getAvatarUrl } from '../../../../shared/utils/avatarUtils.js';

const UserSelectionList = ({ users = [], selectedUsers = [], onToggleUser }) => (
    <div style={{
        padding: '0 16px',
        flex: 1,
        minHeight: 0,
        maxHeight: '180px', // Giới hạn để hiển thị ~3 người (mỗi item ~60px)
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
        boxSizing: 'border-box',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none' /* IE and Edge - ẩn scrollbar  */
    }}>
        {users.map((user) => {
            const isSelected = selectedUsers.includes(user.name);
            return (
                <div
                    key={user.name}
                    onClick={() => onToggleUser(user.name)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: 10,
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        border: '1px solid transparent',
                        width: '100%',
                        boxSizing: 'border-box',
                        minWidth: 0
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: '#ddd',
                                overflow: 'hidden',
                                flexShrink: 0
                            }}>
                                <img
                                    src={getAvatarUrl(user.name, 128)}
                                    alt={user.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                        <strong style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: colors.normalText,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            minWidth: 0
                        }}>
                            {user.name}
                        </strong>
                    </div>
                    <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? colors.primaryButton : '#ccc'}`,
                        backgroundColor: isSelected ? colors.primaryButton : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {isSelected && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        )}
                    </div>
                </div>
            );
        })}
        {users.length === 0 && (
            <div style={{
                textAlign: 'center',
                padding: '40px 16px',
                color: colors.regularText,
                fontSize: 14
            }}>
                Không tìm thấy người dùng
            </div>
        )}
    </div>
);

export default UserSelectionList;

