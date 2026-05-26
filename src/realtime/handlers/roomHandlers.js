import { updateRoomData, clearPendingRoomCreation } from "../../state/chat/chatSlice";

export const handleCreateRoom = (response, dispatch, socketActions, socketRef, getState) => {
    console.log("Nhận response từ CREATE_ROOM:", response);
    if (response.status === 'success') {
        // Lấy thông tin tạo nhóm đang chờ từ Redux
        const state = getState ? getState() : null;
        const pendingRoom = state?.chat?.pendingRoomCreation;

        if (pendingRoom) {

            console.log("Thông tin pending room:", pendingRoom);

            const { roomName, selectedUsers, currentUserName } = pendingRoom;

            // 1. Join bản thân vào phòng
            socketActions.joinRoom(socketRef, roomName);
            console.log("Đã join bản thân vào phòng:", roomName);

            // 2. Gửi tin nhắn mời vào nhóm cho từng người được chọn (qua chat 1-1)
            // Vì JOIN_ROOM chỉ để tự join, không thể thêm người khác vào group
            console.log("Gửi tin nhắn mời vào nhóm cho:", selectedUsers);
            selectedUsers.forEach((username, index) => {
                setTimeout(() => {
                    const invitationMessage = JSON.stringify({
                        type: "ROOM_INVITE",
                        roomName,
                        from: currentUserName
                    });
                    socketActions.sendChat(socketRef, username, invitationMessage, "people");
                    console.log(`Đã gửi tin nhắn mời vào nhóm "${roomName}" cho:`, username);
                }, index * 300); // Delay từng tin nhắn để tránh spam
            });

            // 3. Gửi tin nhắn thông báo vào phòng (cho các thành viên đã join)
            const userListText = selectedUsers.length > 0
                ? selectedUsers.join(', ')
                : 'không có ai';
            const notificationMessage = `${currentUserName} đã tạo nhóm và mời ${userListText} tham gia`;

            // Delay một chút để đảm bảo join xong trước khi gửi tin nhắn vào phòng
            setTimeout(() => {
                socketActions.sendChat(socketRef, roomName, notificationMessage, "room");
            }, 500);

            // 4. Clear pending room creation
            dispatch(clearPendingRoomCreation());
        }
    } else {
        console.error(`[Socket] Tạo phòng thất bại:`, response.mes);
    }
};

export const handleJoinRoom = (response, dispatch) => {
    if (response.status === 'success') {
        console.log(`[Socket] Join phòng thành công:`, response.data);
        // Cập nhật danh sách thành viên
        if (response.data?.name && (response.data?.userList || response.data?.own)) {
            dispatch(updateRoomData({
                name: response.data.name,
                own: response.data.own,
                userList: response.data.userList
            }));
        }

    } else {
        console.error(`[Socket] Join phòng thất bại:`, response.mes);
    }
};
