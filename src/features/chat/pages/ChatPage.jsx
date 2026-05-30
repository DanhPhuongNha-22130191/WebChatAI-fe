import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./ChatPage.module.css";
import UserHeader from "../components/sidebar/UserHeader.jsx";
import SearchBox from "../components/sidebar/SearchBox.jsx";
import RoomList from "../components/sidebar/RoomList.jsx";
import ChatRoomCard from "../components/chatbox/ChatRoomCard.jsx";
import ChatPlaceholder from "../components/chatbox/ChatPlaceholder.jsx";
import ChatInfo from "../components/chatbox/ChatInfo.jsx";
import { useChatSidebar } from "../hooks/useChatSidebar.js";
import { useChatMessage } from "../hooks/useChatMessage.js";
import { useSocket } from '../../../app/providers/useSocket';
import { useApi } from '../../../app/providers/useApi';
import CreateRoomModal from "../components/sidebar/CreateRoomModal.jsx";
import SearchResult from "../components/sidebar/SearchResult.jsx";
import ContactRequestModal from "../components/sidebar/ContactRequestModal.jsx";
import ContactRequestsModal from "../components/sidebar/ContactRequestsModal.jsx";
import { usePendingActions } from "../hooks/usePendingActions";
import { useChatTheme } from "../hooks/useChatTheme";
import AddMemberModal from "../components/chatbox/AddMemberModal.jsx";
import RenameRoomModal from "../components/chatbox/RenameRoomModal.jsx";
import LeaveRoomModal from "../components/chatbox/LeaveRoomModal.jsx";
import PageHeader from "../components/headerChat/PageHeader.jsx"; // Import PageHeader
import LogoutModal from "../components/headerChat/LogoutModal.jsx"; // Import LogoutModal
import Iridescence from "../../../shared/components/Iridescence.jsx"; // Hiệu ứng nền

const ChatPage = () => {
    const navigate = useNavigate();
    const { title, rooms, selectRoom } = useChatSidebar();
    const { actions: socketActions, isReady } = useSocket();
    const { sendContactRequest } = usePendingActions();
    const { changeTheme } = useChatTheme(); // Initialize theme management
    const user = useSelector((s) => s.auth.user);

    // Hook ChatMessage (Quản lý chi tiết chat: message, member, actions)
    const {
        activeChat,
        messages,
        myUsername,
        isOnline,
        memberList,
        showInfo,
        setShowInfo,
        inputText,
        setInputText,
        page,
        isLoading,
        messagesEndRef,
        chatContainerRef,
        handleScroll,
        handleSend,
        handleAddMember,
        // File props
        selectedFile,
        isUploading,
        handleSelectFile,
        handleRemoveFile,
        handleRetry
    } = useChatMessage();

    // States cho phần liên hệ
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showContactRequest, setShowContactRequest] = useState(false);
    const [contactRecipient, setContactRecipient] = useState('');
    const [showContactRequests, setShowContactRequests] = useState(false);
    const [contactError, setContactError] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [showRenameRoom, setShowRenameRoom] = useState(false);
    const [renameRoomError, setRenameRoomError] = useState("");
    const [isRenamingRoom, setIsRenamingRoom] = useState(false);
    const [showLeaveRoom, setShowLeaveRoom] = useState(false);
    const [leaveRoomError, setLeaveRoomError] = useState("");
    const [isLeavingRoom, setIsLeavingRoom] = useState(false);

    // Tự điều hướng sang login page nếu không có user và code
    useEffect(() => {
        const hasCode = localStorage.getItem('re_login_code');
        if (!user && !hasCode) {
            navigate("/login", { replace: true });
        }
    }, [user, navigate]);

    // Reset info panel when changing chat
    useEffect(() => {
        setShowInfo(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChat]);

    // Override handleCreateRoom để dùng modal thay vì prompt
    const handleCreateRoom = () => {
        setShowCreateRoom(true);
    };

    // Filter rooms theo search query
    const filteredRooms = useMemo(() => {
        if (!searchQuery.trim()) return rooms;
        const query = searchQuery.toLowerCase();
        return rooms.filter(room =>
            room.name.toLowerCase().includes(query)
        );
    }, [rooms, searchQuery]);

    // Kiểm tra xem có nên hiển thị SearchResult không
    const shouldShowSearchResult = useMemo(() => {
        return searchQuery.trim().length > 0 && filteredRooms.length === 0;
    }, [searchQuery, filteredRooms]);

    // Handler khi bấm "Liên hệ" - Check user exist trước
    const handleContact = (username) => {
        // Clear callback cũ và error cũ nếu có (tránh xung đột khi click nhiều lần)
        if (window.__pendingContactCheck) {
            window.__pendingContactCheck = null;
        }
        setContactError('');

        // Lưu username để xử lý khi nhận response
        setContactRecipient(username);

        // Lưu callback vào window để socketHandlers có thể gọi
        window.__pendingContactCheck = {
            username: username,
            onSuccess: () => {
                setShowContactRequest(true);
                setContactError('');
                window.__pendingContactCheck = null;
            },
            onError: () => {
                setContactError('Người dùng không tồn tại');
                window.__pendingContactCheck = null;
            }
        };

        // Kiểm tra user có tồn tại không trước khi mở modal
        socketActions.checkExist(username);
    };

    const handleSendContactRequest = async (recipientName, message) => {
        try {
            await sendContactRequest(recipientName, message);
            setShowContactRequest(false);
            setSearchQuery('');
        } catch (err) {
            setContactError('Không thể gửi yêu cầu liên hệ. Vui lòng thử lại.');
        }
    };

    // Handler mở modal yêu cầu liên hệ
    const handleOpenContactRequests = () => {
        setShowContactRequests(true);
    };

    // Handler khi click vào user trong danh sách yêu cầu liên hệ
    const handleSelectContactRequest = (username) => {
        // Select room và load tin nhắn (logic này đã có trong hook)
        selectRoom({ name: username, type: 0 });
        setShowContactRequests(false);
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        socketActions.logout();
        setShowLogoutConfirm(false);

        // Fallback: nếu socket chưa kịp trả LOGOUT thì vẫn xóa phiên local để tránh kẹt màn hình.
        setTimeout(() => {
            const stillHasToken = localStorage.getItem('jwt_token') || localStorage.getItem('re_login_code');
            if (stillHasToken) {
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('re_login_code');
                localStorage.removeItem('user_name');
                navigate('/login', { replace: true });
            }
        }, 700);
    };

    const handleAddMemberClick = () => {
        if (
            activeChat &&
            (
                activeChat.type === 1 ||
                activeChat.type === "room" ||
                activeChat.type === "group"
            )
        ) {
            socketActions.getRoomMembers(activeChat.name);
        }

        setShowAddMember(true);
    };

    const handleRenameRoom = () => {
        const isGroupChat = activeChat && (
            activeChat.type === 1 ||
            activeChat.type === "room" ||
            activeChat.type === "group"
        );

        if (!isGroupChat) return;

        setRenameRoomError("");
        setIsRenamingRoom(false);
        setShowRenameRoom(true);
    };

    const handleCloseRenameRoom = () => {
        if (isRenamingRoom) return;

        setShowRenameRoom(false);
        setRenameRoomError("");
        window.__pendingRenameRoom = null;
    };

    const handleSubmitRenameRoom = (newName) => {
        if (!activeChat) return;

        if (newName === activeChat.name) {
            setRenameRoomError("Tên mới phải khác tên hiện tại.");
            return;
        }

        setRenameRoomError("");
        setIsRenamingRoom(true);

        window.__pendingRenameRoom = {
            onSuccess: () => {
                setIsRenamingRoom(false);
                setShowRenameRoom(false);
                setRenameRoomError("");
                window.__pendingRenameRoom = null;
            },
            onError: (message) => {
                setIsRenamingRoom(false);
                setRenameRoomError(message || "Không thể đổi tên phòng chat.");
            }
        };

        socketActions.renameRoom(activeChat.name, newName);
    };

    const handleLeaveRoomClick = () => {
        const isGroupChat = activeChat && (
            activeChat.type === 1 ||
            activeChat.type === "room" ||
            activeChat.type === "group"
        );

        if (!isGroupChat) return;

        setLeaveRoomError("");
        setIsLeavingRoom(false);
        setShowLeaveRoom(true);
    };

    const handleCloseLeaveRoom = () => {
        if (isLeavingRoom) return;

        setShowLeaveRoom(false);
        setLeaveRoomError("");
        window.__pendingLeaveRoom = null;
    };

    const handleConfirmLeaveRoom = () => {
        if (!activeChat || isLeavingRoom) return;

        setLeaveRoomError("");
        setIsLeavingRoom(true);

        window.__pendingLeaveRoom = {
            onSuccess: () => {
                setIsLeavingRoom(false);
                setShowLeaveRoom(false);
                setLeaveRoomError("");
                setShowInfo(false);
                window.__pendingLeaveRoom = null;
            },
            onError: (message) => {
                setIsLeavingRoom(false);
                setLeaveRoomError(message || "Không thể rời khỏi phòng chat.");
            }
        };

        socketActions.leaveRoom(activeChat.name);
    };

    return (
        <div className={styles.page}>
            {/* Lớp nền hiệu ứng Iridescence */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <Iridescence
                    color={useMemo(() => [1, 1, 1], [])}
                    speed={0.1}
                    amplitude={0.1}
                    mouseReact={false}
                />
            </div>

            {/* Container chính chứa nội dung chat - Nổi lên trên nền */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <PageHeader onLogout={handleLogoutClick} />
                <div className={styles["chat-container"]}>
                    <div className={styles["chat-sidebar"]}>
                        {/* Sidebar Header có nút tạo phòng và yêu cầu liên hệ */}
                        <UserHeader
                            name={title}
                            onAdd={handleCreateRoom}
                            onContactRequests={handleOpenContactRequests}
                        />
                        <SearchBox
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {/* Hiển thị SearchResult nếu không tìm thấy room nào, ngược lại hiển thị RoomList với nút Liên hệ ở cuối nếu có search query */}
                        {shouldShowSearchResult ? (
                            <SearchResult
                                searchQuery={searchQuery}
                                onContact={handleContact}
                                contactError={contactError}
                            />
                        ) : (
                            <RoomList
                                rooms={filteredRooms}
                                onSelect={selectRoom}
                                searchQuery={searchQuery}
                                onContact={handleContact}
                                contactError={contactError}
                            />
                        )}
                    </div>
                    <div className={styles["chat-main"]}>
                        {activeChat ? (
                            <ChatRoomCard
                                activeChat={activeChat}
                                messages={messages}
                                myUsername={myUsername}
                                isOnline={isOnline}
                                inputText={inputText}
                                setInputText={setInputText}
                                page={page}
                                isLoading={isLoading}
                                handleSend={handleSend}
                                handleScroll={handleScroll}
                                messagesEndRef={messagesEndRef}
                                chatContainerRef={chatContainerRef}
                                onInfoClick={() => setShowInfo(!showInfo)}
                                // File props
                                selectedFile={selectedFile}
                                isUploading={isUploading}
                                handleSelectFile={handleSelectFile}
                                handleRemoveFile={handleRemoveFile}
                                onRetry={handleRetry}
                                isSocketReady={isReady}
                            />
                        ) : (
                            <ChatPlaceholder />
                        )}
                    </div>
                    {/* Sidebar thông tin chat (ChatInfo) */}
                    {activeChat && showInfo && (
                        <div className={styles["chat-info-sidebar"]}>
                            <ChatInfo
                                isGroup={activeChat.type === 1 || activeChat.type === 'group' || activeChat.type === 'room'}
                                members={memberList}
                                onAddMember={handleAddMemberClick}
                                onRename={handleRenameRoom}
                                onLeaveRoom={handleLeaveRoomClick}
                                onChangeTheme={changeTheme}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Room Modal */}
            {showCreateRoom && (
                <>
                    <div className={styles["create-room-modal-backdrop"]} onClick={() => setShowCreateRoom(false)} />
                    <div className={styles["create-room-modal-container"]}>
                        <CreateRoomModal onClose={() => setShowCreateRoom(false)} />
                    </div>
                </>
            )}
            {/* Contact Request Modal - Gửi tin nhắn liên hệ */}
            {showContactRequest && (
                <>
                    <div className={styles["contact-request-modal-backdrop"]} onClick={() => setShowContactRequest(false)} />
                    <div className={styles["contact-request-modal-container"]}>
                        <ContactRequestModal
                            recipientName={contactRecipient}
                            onClose={() => setShowContactRequest(false)}
                            onSend={handleSendContactRequest}
                        />
                    </div>
                </>
            )}
            {/* Contact Requests Modal - Danh sách yêu cầu liên hệ */}
            {showContactRequests && (
                <>
                    <div className={styles["create-room-modal-backdrop"]} onClick={() => setShowContactRequests(false)} />
                    <div className={styles["create-room-modal-container"]}>
                        <ContactRequestsModal
                            onClose={() => setShowContactRequests(false)}
                            onSelectUser={handleSelectContactRequest}
                        />
                    </div>
                </>
            )}

            {/* Logout Confirm Modal */}
            {showLogoutConfirm && (
                <LogoutModal
                    onClose={() => setShowLogoutConfirm(false)}
                    onConfirm={handleConfirmLogout}
                />
            )}

            {showRenameRoom && activeChat && (
                <RenameRoomModal
                    roomName={activeChat.name}
                    onClose={handleCloseRenameRoom}
                    onConfirm={handleSubmitRenameRoom}
                    error={renameRoomError}
                    isSaving={isRenamingRoom}
                />
            )}

            {showLeaveRoom && activeChat && (
                <LeaveRoomModal
                    roomName={activeChat.name}
                    onClose={handleCloseLeaveRoom}
                    onConfirm={handleConfirmLeaveRoom}
                    error={leaveRoomError}
                    isLeaving={isLeavingRoom}
                />
            )}

            {/* Add Member Modal */}
            {showAddMember && activeChat && (
                <>
                    <div className={styles["add-member-modal-backdrop"]} onClick={() => setShowAddMember(false)} />
                    <div className={styles["add-member-modal-container"]}>
                        <AddMemberModal
                            onClose={() => setShowAddMember(false)}
                            roomName={activeChat.name}
                            existingMembers={memberList}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatPage;