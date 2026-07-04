// Đóng gói dữ liệu để gửi đi qua WebSocket
const sendRawData = (socketRef, eventName, dataPayload) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const payload = {
            action: "onchat",
            data: {
                event: eventName,
                data: dataPayload
            }
        };

        const payloadString = JSON.stringify(payload);

        console.log(`[Socket] Gửi request ${eventName}:`, {
            payload: payloadString,
            readyState: socketRef.current.readyState,
            url: socketRef.current.url
        });

        socketRef.current.send(payloadString);

        if (eventName !== "GET_USER_LIST" && eventName !== "SEND_CHAT") {
            console.log(`[Socket] ${eventName}:`, dataPayload);
        }
    } else {
        console.error("Socket chưa kết nối, không thể gửi:", eventName, {
            hasSocket: !!socketRef.current,
            readyState: socketRef.current?.readyState,
            expectedState: WebSocket.OPEN
        });
    }
};



export const socketActions = {
    login: (socketRef, username, password) => {
        sessionStorage.setItem("pending_login_user", username);
        localStorage.setItem("pending_login_user", username);

        sendRawData(socketRef, "LOGIN", {
            user: username,
            pass: password
        });
    },

    reLogin: (socketRef, username, reLoginCode) => {
        sendRawData(socketRef, "RE_LOGIN", {
            user: username,
            code: reLoginCode
        });
    },

    register: (socketRef, username, password) => {
        sendRawData(socketRef, "REGISTER", {
            user: username,
            pass: password
        });
    },

    logout: (socketRef) => {
        sendRawData(socketRef, "LOGOUT", {});
    },

    sendChat: (socketRef, to, message, chatType = "people") => {
        sendRawData(socketRef, "SEND_CHAT", {
            type: chatType,
            to,
            mes: message
        });
    },

    recallMessage: (socketRef, messageId) => {
        sendRawData(socketRef, "RECALL_MESSAGE", {
            messageId
        });
    },

    editMessage: (socketRef, messageId, newContent) => {
        sendRawData(socketRef, "EDIT_MESSAGE", {
            messageId,
            content: newContent
        });
    },

    chatHistory: (socketRef, to, page = 1, size = 30) => {
        sendRawData(socketRef, "GET_PEOPLE_CHAT_MES", {
            name: to,
            page,
            size
        });
    },

    roomHistory: (socketRef, roomName, page = 1, size = 30) => {
        sendRawData(socketRef, "GET_ROOM_CHAT_MES", {
            name: roomName,
            page,
            size
        });
    },

    markRead: (socketRef, messageId) => {
        sendRawData(socketRef, "MARK_READ", {
            messageId
        });
    },

    typing: (socketRef, to, chatType = "people") => {
        sendRawData(socketRef, "TYPING", {
            type: chatType,
            to
        });
    },

    stopTyping: (socketRef, to, chatType = "people") => {
        sendRawData(socketRef, "STOP_TYPING", {
            type: chatType,
            to
        });
    },

    createRoom: (socketRef, roomName) => {
        sendRawData(socketRef, "CREATE_ROOM", {
            name: roomName
        });
    },

    joinRoom: (socketRef, roomName) => {
        sendRawData(socketRef, "JOIN_ROOM", {
            name: roomName
        });
    },

    addUserToRoom: (socketRef, roomName, username) => {
        sendRawData(socketRef, "ADD_USER_TO_ROOM", {
            name: roomName,
            user: username
        });
    },

    getRoomMembers: (socketRef, roomName) => {
        sendRawData(socketRef, "GET_ROOM_MEMBERS", {
            name: roomName
        });
    },

    renameRoom: (socketRef, oldName, newName) => {
        sendRawData(socketRef, "RENAME_ROOM", {
            oldName,
            newName
        });
    },

    leaveRoom: (socketRef, roomName) => {
        sendRawData(socketRef, "LEAVE_ROOM", {
            name: roomName
        });
    },

    checkOnline: (socketRef, username) => {
        window.__pendingCheckOnline = username;

        sendRawData(socketRef, "CHECK_USER_ONLINE", {
            user: username
        });
    },

    checkExist: (socketRef, username) => {
        sendRawData(socketRef, "CHECK_USER_EXIST", {
            user: username
        });
    },

    checkUserExist: (socketRef, username) => {
        sendRawData(socketRef, "CHECK_USER_EXIST", {
            user: username
        });
    },

    getUserList: (socketRef) => {
        sendRawData(socketRef, "GET_USER_LIST", {});
    },

    removeContact: (socketRef, username) => {
    sendRawData(socketRef, "REMOVE_CONTACT", {
        user: username
    });
},

    ping: (socketRef) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketActions.getUserList(socketRef);
        }
    },

    reactMessage: (socketRef, messageId, reaction) => {
    sendRawData(socketRef, "REACT_MESSAGE", {
        messageId,
        reaction
    });
}

    
};
