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

    const people = useSelector((state) => state.chat.people);
    const currentUser = useSelector((state) => state.auth.user);

    const [roomName, setRoomName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    const currentUserName =
        currentUser?.name ||
        currentUser?.user ||
        currentUser?.username ||
        sessionStorage.getItem('user_name') ||
        localStorage.getItem('user_name') ||
        '';

    const availableUsers = people.filter((person) =>
        (person.type === 0 || person.type === 'people') &&
        person.name !== currentUserName &&
        person.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleUser = (username) => {
        setSelectedUsers((previousUsers) =>
            previousUsers.includes(username)
                ? previousUsers.filter((user) => user !== username)
                : [...previousUsers, username]
        );
    };

    const handleCreate = () => {
        const normalizedRoomName = roomName.trim();

        if (!normalizedRoomName) {
            alert('Vui lòng nhập tên nhóm');
            return;
        }

        if (selectedUsers.length === 0) {
            alert('Vui lòng chọn ít nhất 1 thành viên');
            return;
        }

        dispatch(setPendingRoomCreation({
            roomName: normalizedRoomName,
            selectedUsers,
            currentUserName
        }));

        actions.createRoom(normalizedRoomName);

        onClose();
    };

    return (
        <div
            style={{
                height: '100%',
                maxHeight: '100%',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--card-bg)',
                width: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden'
            }}
        >
            <CreateRoomHeader onClose={onClose} />

            <div
                style={{
                    padding: '0 16px',
                    marginTop: 8,
                    marginBottom: 0,
                    width: '100%',
                    boxSizing: 'border-box',
                    flexShrink: 0
                }}
            >
                <TextInput
                    label="Tên nhóm chat"
                    value={roomName}
                    onChange={(event) => setRoomName(event.target.value)}
                    placeholder="Nhập tên nhóm chat"
                />
            </div>

            <div
                style={{
                    padding: '0 16px',
                    marginTop: 8,
                    marginBottom: 0,
                    width: '100%',
                    boxSizing: 'border-box',
                    flexShrink: 0
                }}
            >
                <SearchBar
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Tìm kiếm thành viên"
                />
            </div>

            <div
                style={{
                    marginTop: 8,
                    marginBottom: 8,
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden'
                }}
            >
                <UserSelectionList
                    users={availableUsers}
                    selectedUsers={selectedUsers}
                    onToggleUser={handleToggleUser}
                />
            </div>

            <div
                style={{
                    padding: '0 16px 12px 16px',
                    marginTop: 'auto',
                    width: '100%',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Button
                    onClick={handleCreate}
                    disabled={!roomName.trim() || selectedUsers.length === 0}
                    style={{
                        width: 'auto',
                        minWidth: '140px',
                        padding: '10px 24px'
                    }}
                >
                    Tạo nhóm
                </Button>
            </div>
        </div>
    );
};

export default CreateRoomModal;