import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [],
    people: [], // list trả về từ GET_USER_LIST: [{ name, type, actionTime, lastMessage }, ...]
    activeChat: null, // { name, type } | null
    onlineStatus: {}, // { username: boolean }
    pendingRoomCreation: null, // { roomName, selectedUsers, currentUserName } | null - Lưu thông tin tạo nhóm đang chờ
    hasMore: true, // Trạng thái còn dữ liệu để load hay không
    pendingPage: 1, // Page number đang được fetch
    pendingConversations: [], // Danh sách pending contact requests: [{ username, status, createdAt }, ...]
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setPeople(state, action) {
            const newPeople = action.payload ?? [];

            state.people = newPeople.map(newItem => {
                const existingItem = state.people.find(p => p.name === newItem.name && p.type === newItem.type);

                if (existingItem) {
                    return {
                        ...newItem,
                        // Giu lai userList neu server gui thieu
                        userList: (newItem.userList && newItem.userList.length > 0) ? newItem.userList : existingItem.userList,
                        own: newItem.own !== undefined ? newItem.own : existingItem.own,
                        isOnline: existingItem.isOnline // Giữ trạng thái online 
                    };
                }
                return newItem;
            });
        },
        setOnlineStatus(state, action) {
            const { user, isOnline } = action.payload;
            state.onlineStatus[user] = isOnline;
        },
        setActiveChat(state, action) {
            state.activeChat = action.payload ?? null;
            state.hasMore = true; // Reset hasMore khi đổi chat
        },
        setMessages(state, action) {
            state.messages = action.payload;
        },
        upsertMessage(state, action) {
            const newMessage = action.payload;
            const { activeChat, messages } = state;

            // 1. Kiểm tra tin nhắn có thuộc phòng đang mở hay không
            let isRelevant = false;
            if (activeChat) {
                const isActiveChatRoom = activeChat.type === 1 || activeChat.type === 'room';
                const isActiveChatPeople = activeChat.type === 0 || activeChat.type === 'people';
                const isMsgRoom = newMessage.type === 'room' || newMessage.type === 1;

                if (isActiveChatPeople && !isMsgRoom) {
                    if (newMessage.to === activeChat.name || newMessage.name === activeChat.name) isRelevant = true;
                } else if (isActiveChatRoom && isMsgRoom) {
                    if (newMessage.to === activeChat.name) isRelevant = true;
                }
            }

            // Chỉ thêm tin nhắn nếu nó thuộc phòng đang mở
            if (isRelevant) {
                // Kiểm tra xem tin nhắn này có phải khớp với tin nhắn tạm không
                const optimisticIndex = state.messages.findIndex(m =>
                    (newMessage.tempId && m.tempId === newMessage.tempId) ||
                    (m.status === 'sending' && m.mes === newMessage.mes) 
                );

                if (optimisticIndex !== -1) {
                    // Cập nhật tin nhắn tạm thành tin nhắn thật
                    state.messages[optimisticIndex] = {
                        ...newMessage,
                        status: newMessage.status || 'sent' // Đánh dấu là đã gửi thành công hoặc theo status server trả về
                    };
                } else {
                    // Kiểm tra trùng lặp, check trùng ID(khác null)
                    const isDuplicate = state.messages.some(m =>
                        (m.id && newMessage.id && m.id === newMessage.id) ||
                        (m.createAt === newMessage.createAt && m.name === newMessage.name && m.mes === newMessage.mes)
                    );

                    if (!isDuplicate) {
                        // Thêm tin nhắn mới
                        // Nếu từ socket về, mặc định là sent
                        // Nếu từ UI -> sending
                        state.messages.push({
                            ...newMessage,
                            status: newMessage.status || 'sent'
                        });
                    }
                }
            }
        },

        updateSidebar(state, action) {
            const newMessage = action.payload;
            const currentUserName = localStorage.getItem('user_name') || '';

            let targetName = null;
            let targetType = null;

            if (newMessage.type === 'room' || newMessage.type === 1) {
                targetName = newMessage.to;
                targetType = 1;
            } else {
                targetName = newMessage.name === currentUserName ? newMessage.to : newMessage.name;
                targetType = 0;
            }

            if (!targetName) return;

            const index = state.people.findIndex(p => p.name === targetName);
            const updateData = {
                actionTime: newMessage.createAt || new Date().toISOString(),
                lastMessage: newMessage.mes || newMessage.text || ''
            };

            if (index !== -1) {
                const item = { ...state.people[index], ...updateData };
                state.people.splice(index, 1);
                state.people.unshift(item);
            } else {
                state.people.unshift({
                    name: targetName,
                    type: targetType,
                    ...updateData,
                    isOnline: false
                });
            }
        },
        confirmPendingMessage(state) {
            // Fallback: Nếu server trả status success mà k trả message
            // Tìm tin nhắn sending cũ nhất hiện tại -> set thành sent
            const { activeChat, messages } = state;
            if (!activeChat) return;

            const pendingMsgIndex = messages.findIndex(m =>
                m.status === 'sending' &&
                (m.to === activeChat.name || (activeChat.type !== 1 && m.name === activeChat.name))
            );

            if (pendingMsgIndex !== -1) {
                messages[pendingMsgIndex].status = 'sent';
            }
        },
        // addMessage remains for backward compatibility, but calls the specialized reducers
        addMessage(state, action) {
            chatSlice.caseReducers.upsertMessage(state, action);
            chatSlice.caseReducers.updateSidebar(state, action);
        },

        setChatHistory(state, action) {
            const { messages, page } = action.payload;
            const newMessages = Array.isArray(messages) ? messages : [];

            // Validate page number
            const validPage = typeof page === 'number' && page > 0 ? page : 1;

            // Đảo ngược để có thứ tự: Cũ nhất -> Mới nhất
            const processedMessages = [...newMessages].reverse();

            if (validPage === 1) {
                // Trang đầu tiên: thay thế toàn bộ
                state.messages = processedMessages;
            } else if (newMessages.length > 0) {
                // Trang > 1 và có data: thêm vào đầu
                state.messages = [...processedMessages, ...state.messages];
            }

            // Nếu server trả về mảng rỗng → Hết dữ liệu
            if (newMessages.length === 0) {
                state.hasMore = false;
            }
        },
        clearMessages(state) {
            state.messages = [];
        },
        clearChat(state) {
            state.messages = [];
            state.activeChat = null;
        },
        setPendingRoomCreation(state, action) {
            state.pendingRoomCreation = action.payload;
        },
        clearPendingRoomCreation(state) {
            state.pendingRoomCreation = null;
        },
        setPendingPage(state, action) {
            state.pendingPage = action.payload;
        },
        updateRoomData(state, action) {
            const { name, userList = [], own } = action.payload;

            // Hợp nhất own vào userList nếu chưa có
            let finalUserList = [...userList];
            if (own) {
                const ownerExists = finalUserList.some(u =>
                    (typeof u === 'string' ? u : u.name) === own
                );
                if (!ownerExists) {
                    finalUserList.unshift({ name: own, isOwner: true });
                }
            }

            const index = state.people.findIndex(p => p.name === name && p.type === 1);
            if (index !== -1) {
                state.people[index].userList = finalUserList;
                state.people[index].own = own;
            } else {
                state.people.unshift({
                    name,
                    type: 1,
                    userList: finalUserList,
                    own,
                    actionTime: new Date().toISOString()
                });
            }
        },
        setPendingConversations(state, action) {
            state.pendingConversations = action.payload ?? [];
        },
        removePendingConversation(state, action) {
            const { username } = action.payload;
            state.pendingConversations = state.pendingConversations.filter(
                p => p.username !== username && p.name !== username
            );
        },
    },
});

export const {
    setPeople, setActiveChat, setMessages, addMessage, upsertMessage, updateSidebar,
    setChatHistory, clearChat, setOnlineStatus, clearMessages,
    setPendingRoomCreation, clearPendingRoomCreation,
    setPendingPage, updateRoomData, setPendingConversations, removePendingConversation, confirmPendingMessage
} = chatSlice.actions;

export default chatSlice.reducer;
