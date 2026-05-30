import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../../../../app/providers/useSocket';
import colors from '../../../../shared/constants/colors';
import SearchBar from '../../../../shared/components/SearchBar';
import Button from '../../../../shared/components/Button';
import { getAvatarUrl } from '../../../../shared/utils/avatarUtils';

const scrollbarHideStyle = `
    .add-member-user-list::-webkit-scrollbar {
        display: none;
    }
`;

const AddMemberModal = ({ onClose, roomName, existingMembers = [] }) => {
    const { actions: socketActions } = useSocket();

    const people = useSelector((state) => state.chat.people);
    const currentUser = useSelector((state) => state.auth.user);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');

    const myUsername =
        currentUser?.name ||
        currentUser?.user ||
        currentUser?.username ||
        sessionStorage.getItem('user_name') ||
        localStorage.getItem('user_name') ||
        '';

    const existingSet = new Set(
        existingMembers.map((member) =>
            typeof member === 'string' ? member : member?.name
        )
    );

    const availableUsers = people.filter((person) =>
        (person.type === 0 || person.type === 'people') &&
        person.name !== myUsername &&
        !existingSet.has(person.name) &&
        person.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleUser = (username) => {
        setSelectedUsers((previousUsers) =>
            previousUsers.includes(username)
                ? previousUsers.filter((user) => user !== username)
                : [...previousUsers, username]
        );
    };

    const handleAddMembers = () => {
        if (selectedUsers.length === 0 || !roomName) {
            return;
        }

        setIsProcessing(true);
        setMessage('');

        selectedUsers.forEach((username, index) => {
            setTimeout(() => {
                socketActions.addUserToRoom(roomName, username);
            }, index * 150);
        });

        setMessage(`Đã gửi yêu cầu thêm ${selectedUsers.join(', ')} vào nhóm.`);
        setSelectedUsers([]);

        setTimeout(() => {
            setIsProcessing(false);
        }, selectedUsers.length * 150 + 300);
    };

    return (
        <>
            <style>{scrollbarHideStyle}</style>

            <div
                style={{
                    height: '100%',
                    maxHeight: '100%',
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: colors.cardBackground,
                    width: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                }}
            >
                <div
                    style={{
                        padding: '16px',
                        borderBottom: '1px solid #FFB3D9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#FFB3D9',
                        flexShrink: 0
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: 18, color: '#fff' }}>
                        Thêm thành viên
                    </h2>

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

                <div
                    style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #FFB3D9',
                        flexShrink: 0
                    }}
                >
                    <div style={{ fontSize: 13, color: colors.regularText }}>
                        Nhóm:
                    </div>

                    <div
                        style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: colors.normalText
                        }}
                    >
                        {roomName}
                    </div>
                </div>

                <div
                    style={{
                        padding: '12px 16px',
                        width: '100%',
                        boxSizing: 'border-box',
                        flexShrink: 0
                    }}
                >
                    <SearchBar
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Tìm kiếm người dùng"
                    />
                </div>

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
                    {availableUsers.map((person) => {
                        const isSelected = selectedUsers.includes(person.name);

                        return (
                            <div
                                key={person.name}
                                onClick={() => handleToggleUser(person.name)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 12px',
                                    borderRadius: 10,
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    marginBottom: 8,
                                    border: `1px solid ${
                                        isSelected ? colors.primaryButton : 'transparent'
                                    }`
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        flex: 1,
                                        minWidth: 0
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            backgroundColor: '#ddd',
                                            overflow: 'hidden',
                                            flexShrink: 0
                                        }}
                                    >
                                        <img
                                            src={getAvatarUrl(person.name, 128)}
                                            alt={person.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>

                                    <div
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 500,
                                            color: colors.normalText,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            flex: 1
                                        }}
                                    >
                                        {person.name}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        border: `2px solid ${
                                            isSelected ? colors.primaryButton : '#ccc'
                                        }`,
                                        backgroundColor: isSelected
                                            ? colors.primaryButton
                                            : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}
                                >
                                    {isSelected && (
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {availableUsers.length === 0 && (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '40px 16px',
                                color: colors.regularText,
                                fontSize: 14
                            }}
                        >
                            {searchQuery
                                ? 'Không tìm thấy người dùng'
                                : 'Tất cả người dùng đã có trong nhóm'}
                        </div>
                    )}
                </div>

                {message && (
                    <div
                        style={{
                            padding: '12px 16px',
                            backgroundColor: '#fff',
                            borderTop: '1px solid #FFB3D9',
                            color: '#22c55e',
                            fontSize: 13,
                            flexShrink: 0
                        }}
                    >
                        {message}
                    </div>
                )}

                <div
                    style={{
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'center',
                        borderTop: '1px solid #FFB3D9',
                        backgroundColor: colors.cardBackground,
                        flexShrink: 0
                    }}
                >
                    <Button
                        onClick={handleAddMembers}
                        disabled={selectedUsers.length === 0 || isProcessing}
                        style={{
                            width: 'auto',
                            minWidth: '150px',
                            padding: '10px 24px',
                            opacity:
                                selectedUsers.length === 0 || isProcessing
                                    ? 0.5
                                    : 1
                        }}
                    >
                        {isProcessing
                            ? 'Đang thêm...'
                            : `Thêm thành viên (${selectedUsers.length})`}
                    </Button>
                </div>
            </div>
        </>
    );
};

export default AddMemberModal;