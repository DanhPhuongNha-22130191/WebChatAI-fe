import { addMessage, updateRoomData, setChatHistory } from "../../state/chat/chatSlice";

export const handleSendChat = (response, dispatch, socketActions, socketRef) => {
    console.log("SEND_CHAT response:", response);

    // Nếu có data tin nhắn trả về (có trường mes), dùng addMessage để cập nhật full info (id, time...)
    if (response.data && response.data.mes) {
        dispatch(addMessage(response.data));
    } else if (response.status === 'success' || response.status === true) {
        // Nếu chỉ trả về status success mà không có data tin nhắn -> Confirm tin nhắn cũ nhất đang pending
        dispatch(confirmPendingMessage());
    }

    // Nếu gửi tin nhắn thành công, tự động refresh danh sách user
    // (để cập nhật danh sách ngay sau khi gửi contact request)
    if (response.status === 'success' || response.status === true) {
        console.log("SEND_CHAT thành công, tự động refresh danh sách user");
        // Delay để đảm bảo server đã cập nhật
        setTimeout(() => {
            socketActions.getUserList(socketRef);
        }, 500);
        // Gọi thêm lần nữa sau 1.5s để đảm bảo
        setTimeout(() => {
            socketActions.getUserList(socketRef);
        }, 1500);
    }
};

export const handleGetChatHistory = (response, dispatch, getState) => {
    if (response.status !== 'success') {
        console.error(`[Socket] Lấy lịch sử chat thất bại (${response.event}):`, response.mes);
        return;
    }

    // Lấy page number từ Redux state thay vì biến global window
    const state = getState && typeof getState === 'function' ? getState() : {};
    const currentPage = state.chat?.pendingPage || 1;

    // Phân tách dữ liệu: 1-1 trả về mảng trực tiếp, Room trả về object chứa chatData
    let messages = [];
    if (response.event === "GET_ROOM_CHAT_MES") {
        messages = Array.isArray(response.data?.chatData) ? response.data.chatData : [];

        // Cập nhật thông tin phòng (thành viên, trưởng nhóm)
        if (response.data?.name && (response.data?.userList || response.data?.own)) {
            dispatch(updateRoomData({
                name: response.data.name,
                own: response.data.own,
                userList: response.data.userList
            }));
        }
    } else {
        // People Chat (1-1) thường trả về mảng messages trực tiếp
        messages = Array.isArray(response.data) ? response.data : [];
    }

    console.log(`[Socket] Nhận lịch sử chat (${response.event}) - Page: ${currentPage}, Count: ${messages.length}`);

    dispatch(setChatHistory({
        messages,
        page: currentPage
    }));
};
