import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSocket } from '../../../../app/providers/useSocket';
import { setPendingRoomCreation } from '../../../../state/chat/chatSlice';
import CreateRoomHeader from './CreateRoomHeader';
import TextInput from '../../../../shared/components/TextInput';
import SearchBar from '../../../../shared/components/SearchBar';
import UserSelectionList from './UserSelectionList';
import Button from '../../../../shared/components/Button';

const CreateRoomModal = ({ onClose }) => {
    const { actions } = useSocket();
    const dispatch = useDispatch();
    const people = useSelector((s) => s.chat.people);
    const currentUser = useSelector((s) => s.auth.user);

    const [roomName, setRoomName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    const availableUsers = people.filter(p =>
        (p.type === 0 || p.type === 'people') &&
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleUser = (username) => {
        setSelectedUsers(prev =>
            prev.includes(username)
                ? prev.filter(u => u !== username)
                : [...prev, username]
        );
    };

    const handleCreate = async () => {
        if (!roomName.trim()) {
            alert('Vui lòng nhập tên phòng');
            return;
        }

        if (selectedUsers.length === 0) {
            alert('Vui lòng chọn ít nhất 1 người');
            return;
        }

        // Lấy tên người dùng hiện tại
        const currentUserName = currentUser?.name || currentUser?.user || currentUser?.username || 
                               localStorage.getItem('user_name') || 'bạn';

                               console.log("Bắt đầu tạo nhóm: {", {
                                roomName: roomName.trim(),
                                selectedUsers: selectedUsers,
                                currentUserName: currentUserName
                            });
                        


        // Lưu thông tin tạo nhóm vào Redux để xử lý sau khi nhận response thành công
        dispatch(setPendingRoomCreation({
            roomName: roomName.trim(),
            selectedUsers: selectedUsers,
            currentUserName: currentUserName
        }));

        // Gọi API tạo phòng - logic thêm user sẽ được xử lý trong socketHandlers khi nhận response thành công
        actions.createRoom(roomName.trim());
        console.log("Đã gửi CREATE_ROOM request");
        onClose();
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
            <CreateRoomHeader onClose={onClose} />
            <div style={{ padding: '0 16px', marginTop: 8, marginBottom: 0, width: '100%', boxSizing: 'border-box', flexShrink: 0 }}>
                <TextInput
                    label="Tên phòng chat"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Nhập tên phòng chat"
                />
            </div>
            <div style={{ padding: '0 16px', marginTop: 8, marginBottom: 0, width: '100%', boxSizing: 'border-box', flexShrink: 0 }}>
                <SearchBar
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm người dùng"
                />
            </div>
            <div style={{ marginTop: 8, marginBottom: 8, flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <UserSelectionList
                    users={availableUsers}
                    selectedUsers={selectedUsers}
                    onToggleUser={handleToggleUser}
                />
            </div>
            <div style={{ 
                padding: '0 16px 12px 16px', 
                marginTop: 'auto', 
                width: '100%', 
                boxSizing: 'border-box', 
                flexShrink: 0,
                display: 'flex',
                justifyContent: 'center'
            }}>
                <Button
                    onClick={handleCreate}
                    disabled={!roomName.trim() || selectedUsers.length === 0}
                    style={{
                        width: 'auto',
                        minWidth: '140px',
                        padding: '10px 24px'
                    }}
                >
                    Tạo phòng chat
                </Button>
            </div>
        </div>
    );
};

export default CreateRoomModal;