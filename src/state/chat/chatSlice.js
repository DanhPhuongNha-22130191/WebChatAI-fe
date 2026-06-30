import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  people: [],
  activeChat: null,
  onlineStatus: {},
  pendingRoomCreation: null,
  hasMore: true,
  pendingPage: 1,
  pendingConversations: [],
  typingUsers: {},
};

const isRecalledMessage = (message) => {
  return message?.recalled === true || message?.status === "recalled";
};

const getMessageText = (message) => {
  if (isRecalledMessage(message)) {
    return "Tin nhắn đã được thu hồi";
  }

  return message?.mes ?? message?.content ?? message?.text ?? "";
};

const getCurrentUsername = () => {
  return (
    sessionStorage.getItem("user_name") ||
    sessionStorage.getItem("current_user") ||
    localStorage.getItem("user_name") ||
    localStorage.getItem("current_user") ||
    ""
  );
};

const getConversationInfoFromMessage = (message) => {
  if (!message) {
    return {
      targetName: null,
      targetType: null,
    };
  }

  const currentUsername = getCurrentUsername();

  if (message.type === "room" || message.type === 1) {
    return {
      targetName: message.to ?? message.receiver,
      targetType: 1,
    };
  }

  const senderName = message.name ?? message.sender;
  const receiverName = message.to ?? message.receiver;

  return {
    targetName: senderName === currentUsername ? receiverName : senderName,
    targetType: 0,
  };
};

const updateSidebarPreviewIfCurrentMessage = (
  state,
  oldMessageText,
  updatedMessage,
) => {
  const { targetName, targetType } =
    getConversationInfoFromMessage(updatedMessage);

  if (!targetName) {
    return;
  }

  const sidebarIndex = state.people.findIndex(
    (person) => person.name === targetName && person.type === targetType,
  );

  if (sidebarIndex === -1) {
    return;
  }

  /*
   * Chỉ thay preview khi sidebar đang hiển thị chính nội dung cũ.
   * Tránh trường hợp sửa một tin nhắn cũ làm ghi đè preview
   * của tin nhắn mới hơn.
   */
  if (state.people[sidebarIndex].lastMessage === oldMessageText) {
    state.people[sidebarIndex].lastMessage = getMessageText(updatedMessage);
  }
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setPeople(state, action) {
      const newPeople = action.payload ?? [];

      const mergedPeople = newPeople.map((newItem) => {
        const existingItem = state.people.find(
          (person) =>
            person.name === newItem.name && person.type === newItem.type,
        );

        if (existingItem) {
          return {
            ...existingItem,
            ...newItem,

            // Giữ preview tin nhắn mới nhất ở FE
            lastMessage: existingItem.lastMessage || newItem.lastMessage,

            actionTime: existingItem.actionTime || newItem.actionTime,

            userList:
              newItem.userList && newItem.userList.length > 0
                ? newItem.userList
                : existingItem.userList,

            own: newItem.own !== undefined ? newItem.own : existingItem.own,

            isOnline: existingItem.isOnline,
          };
        }

        return newItem;
      });

      // Sắp xếp chat có tin nhắn mới lên đầu
      state.people = mergedPeople.sort((a, b) => {
        const timeA = a.actionTime ? new Date(a.actionTime).getTime() : 0;
        const timeB = b.actionTime ? new Date(b.actionTime).getTime() : 0;

        return timeB - timeA;
      });
    },

    setOnlineStatus(state, action) {
      const { user, isOnline } = action.payload;

      state.onlineStatus[user] = isOnline;
    },

    setActiveChat(state, action) {
      state.activeChat = action.payload ?? null;
      state.hasMore = true;
    },

    setMessages(state, action) {
      state.messages = action.payload ?? [];
    },

    upsertMessage(state, action) {
      const newMessage = action.payload;

      if (!newMessage || !state.activeChat) {
        return;
      }

      const activeChat = state.activeChat;

      const isActiveChatRoom =
        activeChat.type === 1 ||
        activeChat.type === "room" ||
        activeChat.type === "group";

      const isActiveChatPeople =
        activeChat.type === 0 || activeChat.type === "people";

      const isMessageRoom = newMessage.type === "room" || newMessage.type === 1;

      let isRelevant = false;

      if (isActiveChatPeople && !isMessageRoom) {
        isRelevant =
          newMessage.to === activeChat.name ||
          newMessage.name === activeChat.name ||
          newMessage.receiver === activeChat.name ||
          newMessage.sender === activeChat.name;
      }

      if (isActiveChatRoom && isMessageRoom) {
        isRelevant =
          newMessage.to === activeChat.name ||
          newMessage.receiver === activeChat.name;
      }

      if (!isRelevant) {
        return;
      }

      const optimisticIndex = state.messages.findIndex((message) => {
        const sameTemporaryId =
          newMessage.tempId && message.tempId === newMessage.tempId;

        const samePendingContent =
          message.status === "sending" &&
          message.mes === newMessage.mes &&
          message.to === newMessage.to;

        return sameTemporaryId || samePendingContent;
      });

      if (optimisticIndex !== -1) {
        state.messages[optimisticIndex] = {
          ...state.messages[optimisticIndex],
          ...newMessage,
          mes: getMessageText(newMessage),
          content: getMessageText(newMessage),
          recalled: isRecalledMessage(newMessage),
          edited: newMessage.edited === true,
          status: isRecalledMessage(newMessage)
            ? "recalled"
            : newMessage.status || "sent",
        };

        return;
      }

      const isDuplicate = state.messages.some(
        (message) =>
          (message.id != null &&
            newMessage.id != null &&
            String(message.id) === String(newMessage.id)) ||
          (message.createAt === newMessage.createAt &&
            message.name === newMessage.name &&
            message.mes === newMessage.mes),
      );

      if (!isDuplicate) {
        state.messages.push({
          ...newMessage,
          mes: getMessageText(newMessage),
          content: getMessageText(newMessage),
          recalled: isRecalledMessage(newMessage),
          edited: newMessage.edited === true,
          status: isRecalledMessage(newMessage)
            ? "recalled"
            : newMessage.status || "sent",
        });
      }
    },

    updateSidebar(state, action) {
      const newMessage = action.payload;

      if (!newMessage) {
        return;
      }

      const { targetName, targetType } =
        getConversationInfoFromMessage(newMessage);

      if (!targetName) {
        return;
      }

      const index = state.people.findIndex(
        (person) => person.name === targetName && person.type === targetType,
      );

      const updateData = {
        actionTime:
          newMessage.createAt ||
          newMessage.createdAt ||
          new Date().toISOString(),
        lastMessage: getMessageText(newMessage),
      };

      if (index !== -1) {
        const updatedItem = {
          ...state.people[index],
          ...updateData,
        };

        state.people.splice(index, 1);
        state.people.unshift(updatedItem);
      } else {
        state.people.unshift({
          name: targetName,
          type: targetType,
          ...updateData,
          isOnline: false,
        });
      }
    },

    confirmPendingMessage(state, action) {
      const confirmedMessage = action.payload;
      const activeChat = state.activeChat;

      if (!activeChat) {
        return;
      }

      const pendingMessageIndex = state.messages.findIndex((message) => {
        if (message.status !== "sending") {
          return false;
        }

        if (confirmedMessage) {
          return (
            message.mes === confirmedMessage.mes &&
            message.to === confirmedMessage.to
          );
        }

        return (
          message.to === activeChat.name ||
          (activeChat.type !== 1 && message.name === activeChat.name)
        );
      });

      if (pendingMessageIndex === -1) {
        return;
      }

      if (confirmedMessage) {
        state.messages[pendingMessageIndex] = {
          ...state.messages[pendingMessageIndex],
          ...confirmedMessage,
          mes: getMessageText(confirmedMessage),
          content: getMessageText(confirmedMessage),
          recalled: isRecalledMessage(confirmedMessage),
          edited: confirmedMessage.edited === true,
          status: isRecalledMessage(confirmedMessage)
            ? "recalled"
            : confirmedMessage.status || "sent",
        };
      } else {
        state.messages[pendingMessageIndex].status = "sent";
      }
    },

    recallMessageInState(state, action) {
      const recalledMessage = action.payload;

      if (!recalledMessage || recalledMessage.id == null) {
        return;
      }

      const messageIndex = state.messages.findIndex(
        (message) =>
          message.id != null &&
          String(message.id) === String(recalledMessage.id),
      );

      if (messageIndex === -1) {
        return;
      }

      const oldText = getMessageText(state.messages[messageIndex]);

      state.messages[messageIndex] = {
        ...state.messages[messageIndex],
        ...recalledMessage,
        mes: "Tin nhắn đã được thu hồi",
        content: "Tin nhắn đã được thu hồi",
        recalled: true,
        status: "recalled",
      };

      updateSidebarPreviewIfCurrentMessage(
        state,
        oldText,
        state.messages[messageIndex],
      );
    },

    editMessageInState(state, action) {
      const editedMessage = action.payload;

      if (!editedMessage || editedMessage.id == null) {
        return;
      }

      const messageIndex = state.messages.findIndex(
        (message) =>
          message.id != null && String(message.id) === String(editedMessage.id),
      );

      if (messageIndex === -1) {
        return;
      }

      if (isRecalledMessage(state.messages[messageIndex])) {
        return;
      }

      const oldText = getMessageText(state.messages[messageIndex]);
      const newText = getMessageText(editedMessage);

      state.messages[messageIndex] = {
        ...state.messages[messageIndex],
        ...editedMessage,
        mes: newText,
        content: newText,
        recalled: false,
        edited: true,
        status: editedMessage.status || "sent",
      };

      updateSidebarPreviewIfCurrentMessage(
        state,
        oldText,
        state.messages[messageIndex],
      );
    },

    updateMessageStatus(state, action) {
      const updatedMessage = action.payload;

      if (!updatedMessage || updatedMessage.id == null) {
        return;
      }

      const messageIndex = state.messages.findIndex(
        (message) =>
          message.id != null &&
          String(message.id) === String(updatedMessage.id),
      );

      if (messageIndex === -1) {
        return;
      }

      state.messages[messageIndex] = {
        ...state.messages[messageIndex],
        status: updatedMessage.status || state.messages[messageIndex].status,
        deliveredAt:
          updatedMessage.deliveredAt ??
          state.messages[messageIndex].deliveredAt,
        readAt: updatedMessage.readAt ?? state.messages[messageIndex].readAt,
      };
    },

    addMessage(state, action) {
      chatSlice.caseReducers.upsertMessage(state, action);
      chatSlice.caseReducers.updateSidebar(state, action);
    },

    setChatHistory(state, action) {
      const { messages, page, hasMore } = action.payload;
      const newMessages = Array.isArray(messages) ? messages : [];

      const validPage = typeof page === "number" && page > 0 ? page : 1;

      const processedMessages = [...newMessages].reverse().map((message) => ({
        ...message,
        mes: getMessageText(message),
        content: getMessageText(message),
        recalled: isRecalledMessage(message),
        edited: !isRecalledMessage(message) && message.edited === true,
        status: isRecalledMessage(message)
          ? "recalled"
          : message.status || "sent",
      }));

      if (validPage === 1) {
        state.messages = processedMessages;
      } else if (newMessages.length > 0) {
        state.messages = [...processedMessages, ...state.messages];
      }

      if (typeof hasMore === "boolean") {
        state.hasMore = hasMore;
      } else if (newMessages.length === 0) {
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

      let finalUserList = [...userList];

      if (own) {
        const ownerExists = finalUserList.some(
          (user) => (typeof user === "string" ? user : user.name) === own,
        );

        if (!ownerExists) {
          finalUserList.unshift({
            name: own,
            isOwner: true,
          });
        }
      }

      const index = state.people.findIndex(
        (person) => person.name === name && person.type === 1,
      );

      if (index !== -1) {
        state.people[index].userList = finalUserList;
        state.people[index].own = own;
      } else {
        state.people.unshift({
          name,
          type: 1,
          userList: finalUserList,
          own,
          actionTime: new Date().toISOString(),
        });
      }
    },

    setPendingConversations(state, action) {
      state.pendingConversations = action.payload ?? [];
    },

    setTypingState(state, action) {
      const { conversationKey, username, typing } = action.payload;

      if (!conversationKey || !username) {
        return;
      }

      const currentUsers = state.typingUsers[conversationKey] ?? [];

      if (typing) {
        if (!currentUsers.includes(username)) {
          state.typingUsers[conversationKey] = [...currentUsers, username];
        }
      } else {
        state.typingUsers[conversationKey] = currentUsers.filter(
          (name) => name !== username,
        );
      }
    },

   removePendingConversation(state, action) {
    const username = action.payload?.username;

    state.pendingConversations = state.pendingConversations.filter(
        (conversation) =>
            conversation.username !== username &&
            conversation.name !== username &&
            conversation.fromUsername !== username
    );
},
  },
});

export const {
  setPeople,
  setActiveChat,
  setMessages,
  addMessage,
  upsertMessage,
  updateSidebar,
  setChatHistory,
  clearChat,
  setOnlineStatus,
  clearMessages,
  setPendingRoomCreation,
  clearPendingRoomCreation,
  setPendingPage,
  updateRoomData,
  setPendingConversations,
  removePendingConversation,
  confirmPendingMessage,
  recallMessageInState,
  editMessageInState,
  updateMessageStatus,
  setTypingState,
} = chatSlice.actions;

export default chatSlice.reducer;
