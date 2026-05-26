import React from 'react';
import styles from '../pages/ChatPage.module.css';
import CreateRoomModal from "./sidebar/CreateRoomModal.jsx";
import ContactRequestModal from "./sidebar/ContactRequestModal.jsx";
import ContactRequestsModal from "./sidebar/ContactRequestsModal.jsx";
import LogoutModal from "./headerChat/LogoutModal.jsx";
import AddMemberModal from "./chatbox/AddMemberModal.jsx";

const ChatModals = ({
    modals,
    handlers
}) => {
    const {
        showCreateRoom,
        showContactRequest,
        showContactRequests,
        showLogoutConfirm,
        showAddMember,
        activeChat,
        contactRecipient,
        memberList
    } = modals;

    const {
        setShowCreateRoom,
        setShowContactRequest,
        setShowContactRequests,
        setShowLogoutConfirm,
        setShowAddMember,
        handleSendContactRequest,
        handleSelectContactRequest,
        handleConfirmLogout
    } = handlers;

    return (
        <>
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
        </>
    );
};

export default ChatModals;
