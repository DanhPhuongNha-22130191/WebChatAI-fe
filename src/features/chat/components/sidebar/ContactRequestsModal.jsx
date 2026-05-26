import React, { useState, useEffect } from 'react';
import ContactRequestsHeader from './ContactRequestsHeader';
import { usePendingActions } from '../../hooks/usePendingActions';
import colors from '../../../../shared/constants/colors';
import { getAvatarUrl } from '../../../../shared/utils/avatarUtils.js';

const ContactRequestsModal = ({ onClose, onSelectUser }) => {
    const {
        pendingContacts,
        fetchIncomingRequests,
        acceptContact,
        rejectContact
    } = usePendingActions();

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadRequests = async () => {
            setIsLoading(true);
            try {
                await fetchIncomingRequests();
            } catch (err) {
                // Error handling is centralized in UseCase, here we just manage UI state
            } finally {
                setIsLoading(false);
            }
        };

        loadRequests();
    }, [fetchIncomingRequests]);

    const handleAccept = async (fromUsername, e) => {
        e.stopPropagation();
        try {
            await acceptContact(fromUsername);
            if (onSelectUser) {
                onSelectUser(fromUsername);
                onClose();
            }
        } catch (err) {
            // UI can show toast here if needed
        }
    };

    const handleDelete = async (fromUsername, e) => {
        e.stopPropagation();
        try {
            await rejectContact(fromUsername);
        } catch (err) {
            // UI error handling
        }
    };

    return (
        <div style={{
            height: '100%',
            maxHeight: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--card-bg)',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
        }}>
            <ContactRequestsHeader onClose={onClose} />

            {/* Danh sách yêu cầu liên hệ */}
            <div style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: '8px 0'
            }}>
                {isLoading ? (
                    <div style={{
                        padding: '40px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.normalText,
                        fontSize: 14,
                        textAlign: 'center'
                    }}>
                        Đang tải...
                    </div>
                ) : pendingContacts.length === 0 ? (
                    <div style={{
                        padding: '40px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.normalText,
                        fontSize: 14,
                        textAlign: 'center'
                    }}>
                        Chưa có yêu cầu liên hệ nào
                    </div>
                ) : (
                    pendingContacts.map((contact) => {
                        const contactName = contact.username || contact.name || 'Unknown';
                        return (
                            <div
                                key={contactName}
                                style={{
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: '#ddd',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}>
                                    <img
                                        src={getAvatarUrl(contactName, 128)}
                                        alt={contactName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: 15,
                                        fontWeight: 600,
                                        color: colors.primaryText,
                                        marginBottom: 4,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {contactName}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    <button
                                        onClick={(e) => handleAccept(contactName, e)}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: colors.primary || '#007bff',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontSize: 12,
                                            fontWeight: 500
                                        }}
                                    >
                                        Chấp nhận
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(contactName, e)}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#dc3545',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontSize: 12,
                                            fontWeight: 500
                                        }}
                                    >
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ContactRequestsModal;


