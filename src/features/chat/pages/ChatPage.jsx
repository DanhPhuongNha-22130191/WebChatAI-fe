import { useState, useEffect, useMemo } from "react";
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
import { useSocket } from "../../../app/providers/useSocket";
import { useApi } from "../../../app/providers/useApi";
import CreateRoomModal from "../components/sidebar/CreateRoomModal.jsx";
import SearchResult from "../components/sidebar/SearchResult.jsx";
import ContactRequestModal from "../components/sidebar/ContactRequestModal.jsx";
import ContactRequestsModal from "../components/sidebar/ContactRequestsModal.jsx";
import ProfileModal from "../components/sidebar/ProfileModal.jsx";
import { usePendingActions } from "../hooks/usePendingActions";
import { useChatTheme } from "../hooks/useChatTheme";
import { useWebRTCCall } from "../hooks/useWebRTCCall.js";
import CallModal from "../components/call/CallModal.jsx";
import AddMemberModal from "../components/chatbox/AddMemberModal.jsx";
import RenameRoomModal from "../components/chatbox/RenameRoomModal.jsx";
import LeaveRoomModal from "../components/chatbox/LeaveRoomModal.jsx";
import PageHeader from "../components/headerChat/PageHeader.jsx"; // Import PageHeader
import LogoutModal from "../components/headerChat/LogoutModal.jsx"; // Import LogoutModal
import Iridescence from "../../../shared/components/Iridescence.jsx"; // Hiệu ứng nền
import { useSelector, useDispatch } from "react-redux";
import {
  clearMessages,
  setActiveChat,
} from "../../../state/chat/chatSlice";
const ChatPage = () => {
  const navigate = useNavigate();
  const { title, rooms, selectRoom } = useChatSidebar();
  const { actions: socketActions, isReady } = useSocket();
 const {
  sendContactRequest,
  pendingContacts,
  fetchIncomingRequests,
  removeContact,
} = usePendingActions();

  const pendingContactCount = pendingContacts?.length || 0;
  const { changeTheme } = useChatTheme(); // Initialize theme management
  const user = useSelector((s) => s.auth.user);
  const chatPeople = useSelector((s) => s.chat.people || []);
  const dispatch = useDispatch();
  const currentUsername =
    user?.username ||
    user?.user ||
    user?.name ||
    localStorage.getItem("user_name") ||
    sessionStorage.getItem("user_name") ||
    "";
  const webRTCCall = useWebRTCCall({
    socketActions,
    currentUser: currentUsername,
  });
  const [deleteContactTarget, setDeleteContactTarget] = useState(null);
  const [removeMemberTarget, setRemoveMemberTarget] = useState(null);
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
    handleRetry,
    activeTypingUsers,
  } = useChatMessage();

  // States cho phần liên hệ
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactRequest, setShowContactRequest] = useState(false);
  const [contactRecipient, setContactRecipient] = useState("");
  const [showContactRequests, setShowContactRequests] = useState(false);
  const [contactError, setContactError] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showRenameRoom, setShowRenameRoom] = useState(false);
  const [renameRoomError, setRenameRoomError] = useState("");
  const [isRenamingRoom, setIsRenamingRoom] = useState(false);
  const [showLeaveRoom, setShowLeaveRoom] = useState(false);
  const [leaveRoomError, setLeaveRoomError] = useState("");
  const [isLeavingRoom, setIsLeavingRoom] = useState(false);
  const [profileTarget, setProfileTarget] = useState(null);
  
  useEffect(() => {
    if (!user) return;

    fetchIncomingRequests();

    const interval = setInterval(() => {
      fetchIncomingRequests();
    }, 5000);

    return () => clearInterval(interval);
  }, [user, fetchIncomingRequests]);

  // Tự điều hướng sang login page nếu không có user và code
  useEffect(() => {
    const hasCode = localStorage.getItem("re_login_code");
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
    return rooms.filter((room) => room.name.toLowerCase().includes(query));
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
    setContactError("");

    // Lưu username để xử lý khi nhận response
    setContactRecipient(username);

    // Lưu callback vào window để socketHandlers có thể gọi
    window.__pendingContactCheck = {
      username: username,
      onSuccess: () => {
        setShowContactRequest(true);
        setContactError("");
        window.__pendingContactCheck = null;
      },
      onError: () => {
        setContactError("Người dùng không tồn tại");
        window.__pendingContactCheck = null;
      },
    };

    // Kiểm tra user có tồn tại không trước khi mở modal
    socketActions.checkExist(username);
  };

const isActiveGroup = useMemo(() => {
  return !!activeChat && (
    activeChat.type === 1 ||
    activeChat.type === "GROUP" ||
    activeChat.type === "group" ||
    activeChat.type === "room"
  );
}, [activeChat]);

useEffect(() => {
  if (!activeChat || !isActiveGroup) return;
  socketActions.getRoomMembers(activeChat.name);
}, [activeChat?.name, isActiveGroup]);

const activeRoomData = useMemo(() => {
  if (!isActiveGroup || !activeChat) return null;

  const allRooms = [
    ...(Array.isArray(chatPeople) ? chatPeople : []), // ưu tiên Redux gốc vì có role/userList
    ...(Array.isArray(rooms) ? rooms : []),
    activeChat,
  ];

  return allRooms.find((item) =>
    item?.name === activeChat.name &&
    (
      item?.type === 1 ||
      item?.type === "GROUP" ||
      item?.type === "group" ||
      item?.type === "room"
    )
  ) || activeChat;
}, [chatPeople, rooms, activeChat, isActiveGroup]);

const normalizeMember = (member) => {
  if (typeof member === "string") {
    return {
      username: member,
      name: member,
      displayName: member,
      role: "MEMBER",
      isOwner: false,
      isDeputy: false,
    };
  }

  const username = member?.username || member?.user || member?.name || "";
  const rawRole = String(member?.role || "").toUpperCase();

  let role = ["OWNER", "DEPUTY", "MEMBER"].includes(rawRole)
    ? rawRole
    : "";

  if ((!role || role === "MEMBER") && (member?.isOwner === true || member?.own === true)) {
    role = "OWNER";
  }

  if ((!role || role === "MEMBER") && member?.isDeputy === true) {
    role = "DEPUTY";
  }

  if (!role) role = "MEMBER";

  return {
    ...member,
    username,
    name: username,
    displayName: member?.displayName || username,
    role,
    isOwner: role === "OWNER",
    isDeputy: role === "DEPUTY",
  };
};

const roomMembersForPermission = useMemo(() => {
  const fromMemberList = Array.isArray(memberList)
    ? memberList.map(normalizeMember)
    : [];

  const fromRoomData = [
    ...(Array.isArray(activeRoomData?.userList) ? activeRoomData.userList : []),
    ...(Array.isArray(activeRoomData?.members) ? activeRoomData.members : []),
  ].map(normalizeMember);

  const memberMap = new Map();

  fromMemberList.forEach((member) => {
    if (member.username) {
      memberMap.set(member.username, member);
    }
  });

  fromRoomData.forEach((member) => {
    if (!member.username) return;

    const oldMember = memberMap.get(member.username) || {};

    memberMap.set(member.username, {
      ...oldMember,
      ...member,
      role: member.role || oldMember.role || "MEMBER",
      isOwner: member.isOwner === true || member.role === "OWNER",
      isDeputy: member.isDeputy === true || member.role === "DEPUTY",
    });
  });

  return Array.from(memberMap.values());
}, [memberList, activeRoomData]);

const currentUserRole = useMemo(() => {
  if (!isActiveGroup) return "MEMBER";

  const currentMember = roomMembersForPermission.find((member) => {
    const username = member?.username || member?.user || member?.name;
    return username === currentUsername;
  });

  if (currentMember) {
    const role = String(currentMember.role || "").toUpperCase();

    if (role === "OWNER") return "OWNER";
    if (role === "DEPUTY") return "DEPUTY";

    return "MEMBER";
  }

  const ownerUsername =
    activeRoomData?.ownerUsername ||
    activeRoomData?.owner ||
    activeRoomData?.own ||
    activeChat?.ownerUsername ||
    activeChat?.owner ||
    activeChat?.own;

  if (ownerUsername && ownerUsername === currentUsername) {
    return "OWNER";
  }

  return "MEMBER";
}, [
  isActiveGroup,
  roomMembersForPermission,
  currentUsername,
  activeRoomData,
  activeChat,
]);

const getMemberUsername = (member) => {
  if (typeof member === "string") return member;
  return member?.username || member?.user || member?.name || "";
};

  const handleSendContactRequest = async (recipientName) => {
    try {
     await sendContactRequest(recipientName);
      setShowContactRequest(false);
      setSearchQuery("");
    } catch (err) {
      setContactError("Không thể gửi yêu cầu liên hệ. Vui lòng thử lại.");
    }
  };

  // Handler mở modal yêu cầu liên hệ
  const handleOpenContactRequests = () => {
    setShowContactRequests(true);
  };

 const handleDeleteContact = (room) => {
  if (!room?.name) return;
  setDeleteContactTarget(room);
};
const confirmDeleteContact = async () => {
  if (!deleteContactTarget?.name) return;

  const deletedRoom = deleteContactTarget;

  try {
    socketActions.removeContact?.(deletedRoom.name);
    socketActions.getUserList();

    if (
      activeChat?.name === deletedRoom.name &&
      String(activeChat?.type) === String(deletedRoom.type)
    ) {
      selectRoom(null);
      dispatch(setActiveChat(null));
      dispatch(clearMessages());
      setShowInfo(false);
    }
  } catch (err) {
    console.error("Xóa liên hệ thất bại:", err);
  } finally {
    setDeleteContactTarget(null);
  }
};
const handleViewProfile = (room) => {
  setProfileTarget(room);
};

const handleOpenMyProfile = () => {
  const username = user?.username || user?.user || user?.name || localStorage.getItem("user_name");

  setProfileTarget({
    ...user,
    name: username,
    username,
    user: username,
  });
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
      const stillHasToken =
        localStorage.getItem("jwt_token") ||
        localStorage.getItem("re_login_code");
      if (stillHasToken) {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("re_login_code");
        localStorage.removeItem("user_name");
        navigate("/login", { replace: true });
      }
    }, 700);
  };

  const handleAddMemberClick = () => {
    if (
      activeChat &&
      (activeChat.type === 1 ||
        activeChat.type === "room" ||
        activeChat.type === "group")
    ) {
      socketActions.getRoomMembers(activeChat.name);
    }

    setShowAddMember(true);
  };

  const handleRenameRoom = () => {
    const isGroupChat =
      activeChat &&
      (activeChat.type === 1 ||
        activeChat.type === "room" ||
        activeChat.type === "group");

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
      },
    };

    socketActions.renameRoom(activeChat.name, newName);
  };

const handleCloseLeaveRoom = () => {
  if (isLeavingRoom) return;
  setShowLeaveRoom(false);
  setLeaveRoomError("");
  window.__pendingLeaveRoom = null;
};

const handleLeaveRoomClick = () => {
  setLeaveRoomError("");
  setShowLeaveRoom(true);
};

const handleConfirmLeaveRoom = (newOwnerUsername) => {
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
    },
  };

  socketActions.leaveRoom(activeChat.name, newOwnerUsername);
};

const registerRoomActionCallback = () => {
  window.__pendingRoomAction = {
    onSuccess: () => {
      if (activeChat?.name) {
        socketActions.getRoomMembers(activeChat.name);
      }
    },
    onError: (message) => {
      window.alert(message || "Thao tác phân quyền nhóm thất bại.");
    },
  };
};

const handlePromoteDeputy = (member) => {
  if (!activeChat?.name) return;

  const username = getMemberUsername(member);
  if (!username) return;

  registerRoomActionCallback();
  socketActions.setRoomDeputy(activeChat.name, username);
};

const handleDemoteDeputy = (member) => {
  if (!activeChat?.name) return;

  const username = getMemberUsername(member);
  if (!username) return;

  registerRoomActionCallback();
  socketActions.removeRoomDeputy(activeChat.name, username);
};

const handleRemoveRoomMember = (member) => {
  if (!activeChat?.name) return;

  const username = getMemberUsername(member);
  if (!username) return;

  setRemoveMemberTarget({
    ...member,
    username,
    name: username,
    roomName: activeChat.name,
    displayName: member?.displayName || member?.name || username,
  });
};

const confirmRemoveRoomMember = () => {
  const roomName = removeMemberTarget?.roomName || activeChat?.name;
  const username = removeMemberTarget?.username;

  if (!roomName || !username) return;

  registerRoomActionCallback();
  socketActions.removeRoomMember(roomName, username);
  setRemoveMemberTarget(null);
};

  const canCallActiveChat =
    activeChat &&
    (activeChat.type === 0 || activeChat.type === "people") &&
    activeChat.name !== currentUsername;

  const handleStartVoiceCall = () => {
    if (!canCallActiveChat) {
      window.alert("Hiện tại chỉ hỗ trợ gọi 1-1 với liên hệ khác.");
      return;
    }

    webRTCCall.startCall(activeChat.name, "audio");
  };

  const handleStartVideoCall = () => {
    if (!canCallActiveChat) {
      window.alert("Hiện tại chỉ hỗ trợ gọi 1-1 với liên hệ khác.");
      return;
    }

    webRTCCall.startCall(activeChat.name, "video");
  };

  return (
    <div className={styles.page}>
      {/* Lớp nền hiệu ứng Iridescence */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Iridescence
          color={useMemo(() => [1, 1, 1], [])}
          speed={0.1}
          amplitude={0.1}
          mouseReact={false}
        />
      </div>

      {/* Container chính chứa nội dung chat - Nổi lên trên nền */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
        }}
      >
        <PageHeader onLogout={handleLogoutClick} />
        <div className={styles["chat-container"]}>
          <div className={styles["chat-sidebar"]}>
            {/* Sidebar Header có nút tạo phòng và yêu cầu liên hệ */}
            <UserHeader
              name={title}
              user={user}
              onProfile={handleOpenMyProfile}
              onAdd={handleCreateRoom}
              onContactRequests={handleOpenContactRequests}
              pendingContactCount={pendingContactCount}
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
  onDeleteContact={handleDeleteContact}
  onViewProfile={handleViewProfile}
  activeRoom={activeChat}
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
                activeTypingUsers={activeTypingUsers}
                onVoiceCall={handleStartVoiceCall}
                onVideoCall={handleStartVideoCall}
              />
            ) : (
              <ChatPlaceholder />
            )}
          </div>
          {/* Sidebar thông tin chat (ChatInfo) */}
          {activeChat && showInfo && (
            <div className={styles["chat-info-sidebar"]}>
             <ChatInfo
  isGroup={isActiveGroup}
  members={roomMembersForPermission}
  currentUsername={currentUsername}
  currentUserRole={currentUserRole}
  onAddMember={handleAddMemberClick}
  onRename={handleRenameRoom}
  onLeaveRoom={handleLeaveRoomClick}
  onPromoteDeputy={handlePromoteDeputy}
  onDemoteDeputy={handleDemoteDeputy}
  onRemoveMember={handleRemoveRoomMember}
  onChangeTheme={changeTheme}
/>
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <>
          <div
            className={styles["create-room-modal-backdrop"]}
            onClick={() => setShowCreateRoom(false)}
          />
          <div className={styles["create-room-modal-container"]}>
            <CreateRoomModal onClose={() => setShowCreateRoom(false)} />
          </div>
        </>
      )}
      {/* Contact Request Modal - Gửi tin nhắn liên hệ */}
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
      {/* Contact Requests Modal - Danh sách yêu cầu liên hệ */}
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

      {profileTarget && (
        <ProfileModal
          target={profileTarget}
          currentUser={user}
          actions={socketActions}
          onClose={() => setProfileTarget(null)}
        />
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
    members={roomMembersForPermission}
    currentUsername={currentUsername}
    currentUserRole={currentUserRole}
    onConfirm={handleConfirmLeaveRoom}
    error={leaveRoomError}
    isLeaving={isLeavingRoom}
  />
)}
{removeMemberTarget && (
  <div
    className={styles.confirmOverlay}
    onClick={() => setRemoveMemberTarget(null)}
  >
    <div
      className={styles.confirmModal}
      onClick={(event) => event.stopPropagation()}
    >
      <div className={styles.confirmIcon}>👥</div>

      <h3>Xóa thành viên?</h3>

      <p>
        Bạn có chắc muốn xóa{" "}
        <strong>{removeMemberTarget.displayName || removeMemberTarget.username}</strong>{" "}
        khỏi nhóm{" "}
        <strong>{removeMemberTarget.roomName || activeChat?.name}</strong> không?
      </p>

      <span>
        Thành viên này sẽ không còn xem hoặc nhắn tin trong nhóm cho đến khi được thêm lại.
      </span>

      <div className={styles.confirmActions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={() => setRemoveMemberTarget(null)}
        >
          Hủy
        </button>

        <button
          type="button"
          className={styles.deleteButton}
          onClick={confirmRemoveRoomMember}
        >
          Xóa thành viên
        </button>
      </div>
    </div>
  </div>
)}
      {deleteContactTarget && (
  <div className={styles.confirmOverlay}>
    <div className={styles.confirmModal}>
      <div className={styles.confirmIcon}>💔</div>

      <h3>Xóa liên hệ?</h3>

      <p>
        Bạn có chắc muốn xóa liên hệ với{" "}
        <strong>{deleteContactTarget.name}</strong> không?
      </p>

      <span>
        Hai bạn sẽ không thể nhắn tin cho nhau cho đến khi kết bạn lại.
        Tin nhắn cũ vẫn được giữ.
      </span>

      <div className={styles.confirmActions}>
        <button
          className={styles.cancelButton}
          onClick={() => setDeleteContactTarget(null)}
        >
          Hủy
        </button>

        <button
          className={styles.deleteButton}
          onClick={confirmDeleteContact}
        >
          Xóa liên hệ
        </button>
      </div>
    </div>
  </div>
)}

      <CallModal
        callState={webRTCCall.callState}
        localVideoRef={webRTCCall.localVideoRef}
        remoteVideoRef={webRTCCall.remoteVideoRef}
        isMicOn={webRTCCall.isMicOn}
        isCameraOn={webRTCCall.isCameraOn}
        onAccept={webRTCCall.acceptCall}
        onReject={webRTCCall.rejectCall}
        onEnd={webRTCCall.endCall}
        onToggleMic={webRTCCall.toggleMic}
        onToggleCamera={webRTCCall.toggleCamera}
      />

      {/* Add Member Modal */}
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
