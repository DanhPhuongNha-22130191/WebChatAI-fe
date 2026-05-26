import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../../../../app/providers/useSocket';
import colors from '../../../../shared/constants/colors';
import SearchBar from '../../../../shared/components/SearchBar';
import Button from '../../../../shared/components/Button';
import { getAvatarUrl } from '../../../../shared/utils/avatarUtils';

// Add style tag for hiding scrollbar
const scrollbarHideStyle = `
    .add-member-user-list::-webkit-scrollbar {
        display: none;
    }
`;

const AddMemberModal = ({ onClose, roomName, existingMembers = [] }) => {
    const { actions: socketActions } = useSocket();
    const people = useSelector((s) => s.chat.people);
    const currentUser = useSelector((s) => s.auth.user);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null); // { success: [], failed: [] }

    const myUsername = currentUser?.name || currentUser?.user || currentUser?.username || 
                      localStorage.getItem('user_name') || 'Tôi';

    // Filter: chỉ hiển thị user chưa có trong nhóm, không phải bản thân
    const existingSet = new Set(existingMembers.map(m => m?.name || m));
    const availableUsers = people.filter(p =>
        (p.type === 0 || p.type === 'people') &&
        p.name !== myUsername &&
        !existingSet.has(p.name) &&
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleUser = (username) => {
        setSelectedUsers(prev =>
            prev.includes(username)
                ? prev.filter(u => u !== username)
                : [...prev, username]
        );
    };

    const handleInvite = async () => {
        if (selectedUsers.length === 0) return;

        setIsProcessing(true);
        setResult(null);

        const success = [];
        const failed = [];

        // Helper: kiểm tra tồn tại và gửi thiệp mời
        const checkAndInvite = (username) => new Promise((resolve) => {
            window.__pendingContactCheck = {
                username,
                onSuccess: () => {
                    try {
                        const invitationMessage = JSON.stringify({
                            type: 'ROOM_INVITE',
                            roomName,
                            from: myUsername
                        });
                        socketActions.sendChat(username, invitationMessage, 'people');
                        // Thông báo vào phòng
                        const notify = `${myUsername} đã mời ${username} tham gia nhóm`;
                        socketActions.sendChat(roomName, notify, 'room');
                        success.push(username);
                    } catch (e) {
                        failed.push(username);
                    } finally {
                        resolve();
                    }
                },
                onError: () => {
                    failed.push(username);
                    resolve();
                }
            };
            socketActions.checkExist(username);
        });

        for (let i = 0; i < selectedUsers.length; i++) {
            // eslint-disable-next-line no-await-in-loop
            await checkAndInvite(selectedUsers[i]);
            // eslint-disable-next-line no-await-in-loop
            await new Promise(r => setTimeout(r, 200));
        }

        setResult({ success, failed });
        setIsProcessing(false);
        setSelectedUsers([]);
    };

    return (
        <>
            <style>{scrollbarHideStyle}</style>
            <div style={{
                height: '100%',
                maxHeight: '100%',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: colors.cardBackground,
                width: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden'
            }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid #FFB3D9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#FFB3D9',
                flexShrink: 0
            }}>
                <h2 style={{ margin: 0, fontSize: 18, color: '#fff' }}>Thêm thành viên</h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: 24,
                        cursor: 'pointer',
                        color: '#fff',
                        padding: 0,
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ×
                </button>
            </div>

            {/* Room name display */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #FFB3D9', flexShrink: 0 }}>
                <div style={{ fontSize: 13, color: colors.regularText }}>Phòng:</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: colors.normalText }}>{roomName}</div>
            </div>

            {/* Search bar */}
            <div style={{ padding: '12px 16px', width: '100%', boxSizing: 'border-box', flexShrink: 0 }}>
                <SearchBar
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm người dùng"
                />
            </div>

            {/* User list */}
            <div 
                className="add-member-user-list"
                style={{ 
                    flex: 1, 
                    minHeight: 0, 
                    overflowY: 'auto', 
                    padding: '0 16px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {availableUsers.map((user) => {
                    const isSelected = selectedUsers.includes(user.name);
                    return (
                        <div
                            key={user.name}
                            onClick={() => handleToggleUser(user.name)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 12px',
                                borderRadius: 10,
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                marginBottom: 8,
                                border: '1px solid transparent',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fff';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                                <div style={{
                                    width: 36,
                                    height: 36,
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
                                <div style={{
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: colors.normalText,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1
                                }}>
                                    {user.name}
                                </div>
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
                {availableUsers.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 16px',
                        color: colors.regularText,
                        fontSize: 14
                    }}>
                        {searchQuery ? 'Không tìm thấy người dùng' : 'Tất cả người dùng đã có trong nhóm'}
                    </div>
                )}
            </div>

            {/* Result message */}
            {result && (
                <div style={{ padding: '12px 16px', backgroundColor: '#fff', borderTop: '1px solid #FFB3D9', flexShrink: 0 }}>
                    {result.success.length > 0 && (
                        <div style={{ fontSize: 13, color: '#22c55e', marginBottom: 4 }}>
                            ✓ Đã mời: {result.success.join(', ')}
                        </div>
                    )}
                    {result.failed.length > 0 && (
                        <div style={{ fontSize: 13, color: '#ef4444' }}>
                            ✗ Không tồn tại: {result.failed.join(', ')}
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div style={{
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'center',
                gap: 12,
                borderTop: '1px solid #FFB3D9',
                backgroundColor: colors.cardBackground,
                flexShrink: 0
            }}>
                <Button
                    onClick={handleInvite}
                    disabled={selectedUsers.length === 0 || isProcessing}
                    style={{
                        width: 'auto',
                        minWidth: '140px',
                        padding: '10px 24px',
                        opacity: (selectedUsers.length === 0 || isProcessing) ? 0.5 : 1
                    }}
                >
                    {isProcessing ? 'Đang gửi...' : `Gửi lời mời (${selectedUsers.length})`}
                </Button>
            </div>
        </div>
        </>
    );
};

export default AddMemberModal;
