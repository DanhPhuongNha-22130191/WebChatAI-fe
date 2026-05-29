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
import CreateRoomModal from "../components/sidebar/CreateRoomModal.jsx";
import SearchResult from "../components/sidebar/SearchResult.jsx";
import ContactRequestModal from "../components/sidebar/ContactRequestModal.jsx";
import ContactRequestsModal from "../components/sidebar/ContactRequestsModal.jsx";
import AddMemberModal from "../components/chatbox/AddMemberModal.jsx";
import PageHeader from "../components/headerChat/PageHeader.jsx";
import LogoutModal from "../components/headerChat/LogoutModal.jsx";
import Iridescence from "../../../shared/components/Iridescence.jsx";

import { useChatSidebar } from "../hooks/useChatSidebar.js";
import { useChatMessage } from "../hooks/useChatMessage.js";
import { useSocket } from "../../../app/providers/useSocket";
import { usePendingActions } from "../hooks/usePendingActions";
import { useChatTheme } from "../hooks/useChatTheme";

const ChatPage = () => {
    const navigate = useNavigate();

    const { title, rooms, selectRoom } = useChatSidebar();
    const { actions: socketActions, isReady } = useSocket();
    const { sendContactRequest } = usePendingActions();
    const { changeTheme } = useChatTheme();

    const user = useSelector((s) => s.auth.user);

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
        selectedFile,
        isUploading,
        handleSelectFile,
        handleRemoveFile,
        handleRetry
    } = useChatMessage();

    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showContactRequest, setShowContactRequest] = useState(false);
    const [contactRecipient, setContactRecipient] = useState("");
    const [showContactRequests, setShowContactRequests] = useState(false);
    const [contactError, setContactError] = useState("");
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);

    useEffect(() => {
        const hasCode = localStorage.getItem("re_login_code");

        if (!user && !hasCode) {
            navigate("/login", { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        setShowInfo(false);
    }, [activeChat, setShowInfo]);

    const handleCreateRoom = () => {
        setShowCreateRoom(true);
    };

    const filteredRooms = useMemo(() => {
        if (!searchQuery.trim()) return rooms;

        const query = searchQuery.toLowerCase();

        return rooms.filter((room) =>
            room.name.toLowerCase().includes(query)
        );
    }, [rooms, searchQuery]);

    const shouldShowSearchResult = useMemo(() => {
        return searchQuery.trim().length > 0 && filteredRooms.length === 0;
    }, [searchQuery, filteredRooms]);

    const handleContact = (username) => {
        if (window.__pendingContactCheck) {
            window.__pendingContactCheck = null;
        }

        setContactError("");
        setContactRecipient(username);

        window.__pendingContactCheck = {
            username,
            onSuccess: () => {
                setShowContactRequest(true);
                setContactError("");
                window.__pendingContactCheck = null;
            },
            onError: () => {
                setContactError("Người dùng không tồn tại");
                window.__pendingContactCheck = null;
            }
        };

        socketActions.checkExist(username);
    };

    const handleSendContactRequest = async (recipientName, message) => {
        try {
            await sendContactRequest(recipientName, message);
            setShowContactRequest(false);
            setSearchQuery("");
        } catch (err) {
            setContactError("Không thể gửi yêu cầu liên hệ. Vui lòng thử lại.");
        }
    };

    const handleOpenContactRequests = () => {
        setShowContactRequests(true);
    };

    const handleSelectContactRequest = (username) => {
        selectRoom({
            name: username,
            type: 0
        });

        setShowContactRequests(false);
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        socketActions.logout();
        setShowLogoutConfirm(false);

        setTimeout(() => {
            const stillHasToken = localStorage.getItem("jwt_token")
                || localStorage.getItem("re_login_code");

            if (stillHasToken) {
                localStorage.removeItem("jwt_token");
                localStorage.removeItem("re_login_code");
                localStorage.removeItem("user_name");
                navigate("/login", { replace: true });
            }
        }, 700);
    };

    const handleAddMemberClick = () => {
        setShowAddMember(true);
    };

    return (
        <div className={styles.page}>
            <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <Iridescence
                    color={useMemo(() => [1, 1, 1], [])}
                    speed={0.1}
                    amplitude={0.1}
                    mouseReact={false}
                />
            </div>

            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    width: "100%"
                }}
            >
                <PageHeader onLogout={handleLogoutClick} />

                <div className={styles["chat-container"]}>
                    <div className={styles["chat-sidebar"]}>
                        <UserHeader
                            name={title}
                            onAdd={handleCreateRoom}
                            onContactRequests={handleOpenContactRequests}
                        />

                        <SearchBox
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

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

                    {activeChat && showInfo && (
                        <div className={styles["chat-info-sidebar"]}>
                            <ChatInfo
                                isGroup={
                                    activeChat.type === 1
                                    || activeChat.type === "group"
                                    || activeChat.type === "room"
                                }
                                members={memberList}
                                onAddMember={handleAddMemberClick}
                                onChangeTheme={changeTheme}
                            />
                        </div>
                    )}
                </div>
            </div>

            {showCreateRoom && (
                <>
                    <div
                        className={styles["create-room-modal-backdrop"]}
                        onClick={() => setShowCreateRoom(false)}
                    />

                    <div className={styles["create-room-modal-container"]}>
                        <CreateRoomModal
                            onClose={() => setShowCreateRoom(false)}
                        />
                    </div>
                </>
            )}

            {showContactRequest && (
                <>
                    <div
                        className={styles["contact-request-modal-backdrop"]}
                        onClick={() => setShowContactRequest(false)}
                    />

                    <div className={styles["contact-request-modal-container"]}>
                        <ContactRequestModal
                            recipientName={contactRecipient}
                            onClose={() => setShowContactRequest(false)}
                            onSend={handleSendContactRequest}
                        />
                    </div>
                </>
            )}

            {showContactRequests && (
                <>
                    <div
                        className={styles["create-room-modal-backdrop"]}
                        onClick={() => setShowContactRequests(false)}
                    />

                    <div className={styles["create-room-modal-container"]}>
                        <ContactRequestsModal
                            onClose={() => setShowContactRequests(false)}
                            onSelectUser={handleSelectContactRequest}
                        />
                    </div>
                </>
            )}

            {showLogoutConfirm && (
                <LogoutModal
                    onClose={() => setShowLogoutConfirm(false)}
                    onConfirm={handleConfirmLogout}
                />
            )}

            {showAddMember && activeChat && (
                <>
                    <div
                        className={styles["add-member-modal-backdrop"]}
                        onClick={() => setShowAddMember(false)}
                    />

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