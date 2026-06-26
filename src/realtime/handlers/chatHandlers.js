import {
    addMessage,
    updateRoomData,
    setChatHistory,
    confirmPendingMessage,
    recallMessageInState,
    editMessageInState,
    updateMessageStatus,
    setTypingState
} from "../../state/chat/chatSlice";

const normalizeMessage = (raw) => {
    if (!raw) return null;

    const isRecalled =
        raw.recalled === true ||
        raw.status === "recalled";

    const isEdited = raw.edited === true;

    const rawMessageText = isRecalled
        ? "Tin nhắn đã được thu hồi"
        : (raw.mes ?? raw.content ?? raw.text ?? "");

    const messageText = rawMessageText == null
        ? ""
        : String(rawMessageText);

    const senderName =
        raw.name ??
        raw.sender ??
        raw.from ??
        "";

    const receiverName =
        raw.to ??
        raw.receiver ??
        "";

    const createdAt =
        raw.createAt ??
        raw.createdAt ??
        raw.time ??
        new Date().toISOString();

    return {
        ...raw,
        name: senderName,
        sender: raw.sender ?? senderName,
        to: receiverName,
        receiver: raw.receiver ?? receiverName,
        mes: messageText,
        content: messageText,
        createAt: createdAt,
        createdAt,
        type: raw.type ?? "people",
        recalled: isRecalled,
        edited: isEdited,
        status: isRecalled
            ? "recalled"
            : (raw.status || "sent")
    };
};

export const handleSendChat = (
    response,
    dispatch,
    socketActions,
    socketRef
) => {
    console.log("SEND_CHAT response:", response);

    if (response.status !== "success" && response.status !== true) {
        console.error("SEND_CHAT thất bại:", response.mes || response);
        return;
    }

    const normalizedMessage = normalizeMessage(response.data);

    /*
     * Người gửi đã có tin nhắn tạm trên giao diện.
     * Khi backend trả Message sent, cập nhật tin nhắn tạm
     * thành tin nhắn thật để có id trong database.
     */
    if (response.mes === "Message sent") {
        dispatch(confirmPendingMessage(normalizedMessage));
    } else if (response.mes === "New message") {
        if (normalizedMessage && normalizedMessage.mes !== undefined) {
            dispatch(addMessage(normalizedMessage));
        }
    }

    setTimeout(() => {
        socketActions.getUserList(socketRef);
    }, 500);
};

export const handleRecallMessage = (
    response,
    dispatch,
    socketActions,
    socketRef
) => {
    console.log("RECALL_MESSAGE response:", response);

    if (response.status !== "success" && response.status !== true) {
        console.error("Thu hồi tin nhắn thất bại:", response.mes || response);
        alert(response.mes || "Không thể thu hồi tin nhắn");
        return;
    }

    const recalledMessage = normalizeMessage(response.data);

    if (!recalledMessage || !recalledMessage.id) {
        console.error(
            "Dữ liệu tin nhắn thu hồi không hợp lệ:",
            response.data
        );
        return;
    }

    /*
     * Dùng chung cho:
     * - Người gửi vừa bấm thu hồi
     * - Người nhận nhận realtime từ backend
     */
    dispatch(recallMessageInState(recalledMessage));

    setTimeout(() => {
        socketActions.getUserList(socketRef);
    }, 300);
};

export const handleEditMessage = (
    response,
    dispatch,
    socketActions,
    socketRef
) => {
    console.log("EDIT_MESSAGE response:", response);

    if (response.status !== "success" && response.status !== true) {
        console.error(
            "Chỉnh sửa tin nhắn thất bại:",
            response.mes || response
        );
        alert(response.mes || "Không thể chỉnh sửa tin nhắn");
        return;
    }

    const editedMessage = normalizeMessage(response.data);

    if (!editedMessage || !editedMessage.id) {
        console.error(
            "Dữ liệu tin nhắn chỉnh sửa không hợp lệ:",
            response.data
        );
        return;
    }

    /*
     * Dùng chung cho:
     * - Người gửi vừa lưu nội dung chỉnh sửa
     * - Người nhận / thành viên nhóm nhận realtime
     */
    dispatch(editMessageInState(editedMessage));

    setTimeout(() => {
        socketActions.getUserList(socketRef);
    }, 300);
};

export const handleGetChatHistory = (
    response,
    dispatch,
    getState
) => {
    if (response.status !== "success") {
        console.error(
            `[Socket] Lấy lịch sử chat thất bại (${response.event}):`,
            response.mes
        );
        return;
    }

    const state =
        getState && typeof getState === "function"
            ? getState()
            : {};

    const currentPage = state.chat?.pendingPage || 1;

    let messages = [];

    let hasMore;
    let responsePage;

    if (response.event === "GET_ROOM_CHAT_MES") {
        const rawMessages = Array.isArray(response.data?.chatData)
            ? response.data.chatData
            : Array.isArray(response.data?.messages)
                ? response.data.messages
            : Array.isArray(response.data)
                ? response.data
                : [];

        messages = rawMessages
            .map(normalizeMessage)
            .filter(Boolean);
        hasMore = response.data?.hasMore;
        responsePage = response.data?.page;

        if (
            response.data?.name &&
            (response.data?.userList || response.data?.own)
        ) {
            dispatch(updateRoomData({
                name: response.data.name,
                own: response.data.own,
                userList: response.data.userList
            }));
        }
    } else {
        const rawMessages = Array.isArray(response.data?.messages)
            ? response.data.messages
            : Array.isArray(response.data)
                ? response.data
                : [];

        messages = Array.isArray(rawMessages)
            ? rawMessages
                .map(normalizeMessage)
                .filter(Boolean)
            : [];
        hasMore = response.data?.hasMore;
        responsePage = response.data?.page;
    }

    console.log(
        `[Socket] Nhận lịch sử chat (${response.event}) - Page: ${currentPage}, Count: ${messages.length}`
    );

    dispatch(setChatHistory({
        messages,
        page: responsePage || currentPage,
        hasMore
    }));
};

export const handleMessageStatus = (response, dispatch) => {
    if (response.status !== "success") {
        return;
    }

    const normalizedMessage = normalizeMessage(response.data);
    dispatch(updateMessageStatus(normalizedMessage));
};

export const handleTyping = (response, dispatch, getState) => {
    if (response.status !== "success" || !response.data) {
        return;
    }

    const state =
        getState && typeof getState === "function"
            ? getState()
            : {};

    const currentUsername =
        state.auth?.user?.user ||
        state.auth?.user?.username ||
        sessionStorage.getItem("user_name") ||
        localStorage.getItem("user_name") ||
        "";

    const username = response.data.from || response.data.name;

    if (!username || username === currentUsername) {
        return;
    }

    const isRoom = response.data.type === "room" || response.data.type === 1;
    const conversationKey = isRoom
        ? `room:${response.data.to}`
        : `people:${username}`;

    dispatch(setTypingState({
        conversationKey,
        username,
        typing: response.event === "TYPING" || response.data.typing === true
    }));
};
