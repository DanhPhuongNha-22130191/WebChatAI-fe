import React from 'react';
import colors from '../../../../shared/constants/colors.js';
import AddMember from './AddMember.jsx';
import { getAvatarUrl } from '../../../../shared/utils/avatarUtils.js';

const ListMember = ({ members = [], isGroup = false, onAddMember, onClose }) => {
    return (
        <div style={{
            height: '100%',
            backgroundColor: 'transparent',
            display: 'flex', flexDirection: 'column'
        }}>
            <div style={{
                height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
                backgroundColor: 'transparent',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                zIndex: 10,
                position: 'relative'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer', color: '#333',
                            display: 'flex', alignItems: 'center', padding: 4, borderRadius: '50%'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <span style={{ fontSize: 17, fontWeight: 700, color: colors.primaryText }}>Thành viên ({members.length})</span>
                </div>

            </div>

            {/* Danh sách members */}
            <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {isGroup && (
                        <div style={{ marginBottom: 4 }}>
                            <AddMember onClick={onAddMember} />
                        </div>
                    )}
                    {members.map((member, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: 12,
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E0E0E0',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s',
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFE5F0';
                                e.currentTarget.style.borderColor = '#FFDAEB';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                                e.currentTarget.style.borderColor = '#E0E0E0';
                            }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: '50%',
                                        backgroundColor: '#ddd',
                                        overflow: 'hidden',
                                        border: '1px solid #eee'
                                    }}>
                                        <img
                                            src={getAvatarUrl(member.name, 128)}
                                            alt={member.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: member.isOnline ? colors.online : colors.offline,
                                        border: '2px solid #fff'
                                    }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                    <strong style={{
                                        fontSize: 15, color: '#333',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>
                                        {member.name}
                                    </strong>
                                    {member.own && <span style={{ fontSize: 11, color: colors.primaryButton, fontWeight: 600 }}>Chủ phòng</span>}
                                </div>
                            </div>
                            <button
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 18,
                                    color: '#888',
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >⋮</button>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
};

export default ListMember;
