import {
    addMessage,
    updateRoomData,
    setChatHistory,
    confirmPendingMessage
} from "../../state/chat/chatSlice";

const normalizeMessage = (raw) => {
    if (!raw) return null;

    const rawMessageText = raw.mes ?? raw.content ?? raw.text ?? "";
    const messageText = rawMessageText == null ? "" : String(rawMessageText);

    const senderName = raw.name ?? raw.sender ?? raw.from ?? "";
    const receiverName = raw.to ?? raw.receiver ?? "";
    const createdAt = raw.createAt ?? raw.createdAt ?? raw.time ?? new Date().toISOString();

    return {
        ...raw,
        name: senderName,
        sender: raw.sender ?? senderName,
        to: receiverName,
        receiver: raw.receiver ?? receiverName,
        mes: messageText,
        content: raw.content ?? messageText,
        createAt: createdAt,
        createdAt,
        type: raw.type ?? "people",
        status: raw.status || "sent"
    };
};

export const handleSendChat = (response, dispatch, socketActions, socketRef) => {
    console.log("SEND_CHAT response:", response);

    if (response.status !== "success" && response.status !== true) {
        console.error("SEND_CHAT thất bại:", response.mes || response);
        return;
    }

    const normalizedMessage = normalizeMessage(response.data);

    if (response.mes === "Message sent") {
        dispatch(confirmPendingMessage());
    } else if (response.mes === "New message") {
        if (normalizedMessage && normalizedMessage.mes !== undefined) {
            dispatch(addMessage(normalizedMessage));
        }
    }

    setTimeout(() => {
        socketActions.getUserList(socketRef);
    }, 500);
};

export const handleGetChatHistory = (response, dispatch, getState) => {
    if (response.status !== "success") {
        console.error(`[Socket] Lấy lịch sử chat thất bại (${response.event}):`, response.mes);
        return;
    }

    const state = getState && typeof getState === "function" ? getState() : {};
    const currentPage = state.chat?.pendingPage || 1;

    let messages = [];

    if (response.event === "GET_ROOM_CHAT_MES") {
        const rawMessages = Array.isArray(response.data?.chatData)
            ? response.data.chatData
            : Array.isArray(response.data)
                ? response.data
                : [];

        messages = rawMessages.map(normalizeMessage).filter(Boolean);

        if (response.data?.name && (response.data?.userList || response.data?.own)) {
            dispatch(updateRoomData({
                name: response.data.name,
                own: response.data.own,
                userList: response.data.userList
            }));
        }
    } else {
        messages = Array.isArray(response.data)
            ? response.data.map(normalizeMessage).filter(Boolean)
            : [];
    }

    console.log(`[Socket] Nhận lịch sử chat (${response.event}) - Page: ${currentPage}, Count: ${messages.length}`);

    dispatch(setChatHistory({
        messages,
        page: currentPage
    }));
};