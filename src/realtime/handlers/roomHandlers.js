import {
    updateRoomData,
    clearPendingRoomCreation,
    setActiveChat,
    clearMessages
} from "../../state/chat/chatSlice";

const saveRoomData = (response, dispatch) => {
    if (!response?.data?.name) {
        return;
    }

    dispatch(updateRoomData({
        name: response.data.name,
        own: response.data.own,
        userList: response.data.userList || []
    }));
};

export const handleCreateRoom = (
    response,
    dispatch,
    socketActions,
    socketRef,
    getState
) => {
    console.log("Nhận response từ CREATE_ROOM:", response);

    if (response.status !== "success") {
        console.error("[Socket] Tạo nhóm thất bại:", response.mes);
        alert(response.mes || "Không thể tạo nhóm");
        return;
    }

    saveRoomData(response, dispatch);

    const roomName = response.data?.name;

    if (roomName) {
        dispatch(setActiveChat({
            name: roomName,
            type: 1
        }));
    }

    const state = getState ? getState() : null;
    const pendingRoom = state?.chat?.pendingRoomCreation;

    if (pendingRoom && roomName) {
        const selectedUsers = pendingRoom.selectedUsers || [];

        selectedUsers.forEach((username, index) => {
            setTimeout(() => {
                socketActions.addUserToRoom(socketRef, roomName, username);
            }, index * 150);
        });

        dispatch(clearPendingRoomCreation());
    }

    socketActions.getUserList(socketRef);
};

export const handleJoinRoom = (response, dispatch) => {
    if (response.status !== "success") {
        console.error("[Socket] Vào nhóm thất bại:", response.mes);
        return;
    }

    console.log("[Socket] Vào nhóm thành công:", response.data);
    saveRoomData(response, dispatch);
};

export const handleAddUserToRoom = (
    response,
    dispatch,
    socketActions,
    socketRef
) => {
    if (response.status !== "success") {
        console.error("[Socket] Thêm thành viên thất bại:", response.mes);
        alert(response.mes || "Không thể thêm thành viên");
        return;
    }

    console.log("[Socket] Thêm thành viên thành công:", response.data);
    saveRoomData(response, dispatch);
    socketActions.getUserList(socketRef);
};

export const handleAddedToRoom = (
    response,
    dispatch,
    socketActions,
    socketRef
) => {
    if (response.status !== "success") {
        return;
    }

    console.log("[Socket] Bạn vừa được thêm vào nhóm:", response.data);
    saveRoomData(response, dispatch);
    socketActions.getUserList(socketRef);
};

export const handleGetRoomMembers = (response, dispatch) => {
    if (response.status !== "success") {
        console.error("[Socket] Không lấy được thành viên nhóm:", response.mes);
        return;
    }

    saveRoomData(response, dispatch);
};

const updateAfterRename = (
    response,
    dispatch,
    socketActions,
    socketRef,
    getState
) => {
    const oldName = response.data?.oldName;
    const newName = response.data?.newName || response.data?.name;

    if (!oldName || !newName) {
        return;
    }

    saveRoomData(response, dispatch);

    const state = getState ? getState() : null;
    const activeChat = state?.chat?.activeChat;

    if (
        activeChat &&
        activeChat.name === oldName &&
        (
            activeChat.type === 1 ||
            activeChat.type === "room" ||
            activeChat.type === "group"
        )
    ) {
        dispatch(setActiveChat({
            ...activeChat,
            name: newName,
            type: 1
        }));
    }

    socketActions.getUserList(socketRef);
};

export const handleRenameRoom = (
    response,
    dispatch,
    socketActions,
    socketRef,
    getState
) => {
    const pendingRename = window.__pendingRenameRoom;

    if (response.status !== "success") {
        console.error("[Socket] Đổi tên nhóm thất bại:", response.mes);

        if (pendingRename?.onError) {
            pendingRename.onError(response.mes || "Không thể đổi tên phòng chat.");
        } else {
            alert(response.mes || "Không thể đổi tên nhóm");
        }
        return;
    }

    console.log("[Socket] Đổi tên nhóm thành công:", response.data);
    updateAfterRename(response, dispatch, socketActions, socketRef, getState);

    if (pendingRename?.onSuccess) {
        pendingRename.onSuccess();
    }
};

export const handleRoomRenamed = (
    response,
    dispatch,
    socketActions,
    socketRef,
    getState
) => {
    if (response.status !== "success") {
        return;
    }

    console.log("[Socket] Nhóm vừa được đổi tên:", response.data);
    updateAfterRename(response, dispatch, socketActions, socketRef, getState);
};


export const handleLeaveRoom = (
    response,
    dispatch,
    socketActions,
    socketRef
) => {
    const pendingLeave = window.__pendingLeaveRoom;

    if (response.status !== "success") {
        console.error("[Socket] Rời nhóm thất bại:", response.mes);

        if (pendingLeave?.onError) {
            pendingLeave.onError(response.mes || "Không thể rời khỏi phòng chat.");
        }
        return;
    }

    dispatch(setActiveChat(null));
    dispatch(clearMessages());
    socketActions.getUserList(socketRef);

    if (pendingLeave?.onSuccess) {
        pendingLeave.onSuccess(response.mes);
    }

    window.__pendingLeaveRoom = null;
};

export const handleRoomMemberLeft = (response, dispatch) => {
    if (response.status !== "success") {
        return;
    }

    console.log("[Socket] Thành viên rời nhóm:", response.data);
    saveRoomData(response, dispatch);
};
