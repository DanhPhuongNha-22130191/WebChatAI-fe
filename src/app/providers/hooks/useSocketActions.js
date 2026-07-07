import { useMemo } from "react";
import { socketActions } from "../../../realtime/socketActions";

export const useSocketActions = (socketRef, lastActivityRef) => {
  const actions = useMemo(
    () => ({
      login: (username, password) => {
        lastActivityRef.current = Date.now();
        socketActions.login(socketRef, username, password);
      },

      register: (username, password) => {
        lastActivityRef.current = Date.now();
        socketActions.register(socketRef, username, password);
      },

      reLogin: (savedUser, code) => {
        lastActivityRef.current = Date.now();
        socketActions.reLogin(socketRef, savedUser, code);
      },

      logout: () => {
        lastActivityRef.current = Date.now();
        socketActions.logout(socketRef);
      },

      sendChat: (to, message, chatType = "people") => {
        lastActivityRef.current = Date.now();
        socketActions.sendChat(socketRef, to, message, chatType);
      },

      recallMessage: (messageId) => {
        lastActivityRef.current = Date.now();
        socketActions.recallMessage(socketRef, messageId);
      },

      editMessage: (messageId, newContent) => {
        lastActivityRef.current = Date.now();
        socketActions.editMessage(socketRef, messageId, newContent);
      },

      chatHistory: (to, page = 1, size = 30) => {
        lastActivityRef.current = Date.now();
        socketActions.chatHistory(socketRef, to, page, size);
      },

      roomHistory: (roomName, page = 1, size = 30) => {
        lastActivityRef.current = Date.now();
        socketActions.roomHistory(socketRef, roomName, page, size);
      },

      markRead: (messageId) => {
        lastActivityRef.current = Date.now();
        socketActions.markRead(socketRef, messageId);
      },
      reactMessage: (messageId, reaction) => {
        lastActivityRef.current = Date.now();
        socketActions.reactMessage(socketRef, messageId, reaction);
      },

      typing: (to, chatType = "people") => {
        lastActivityRef.current = Date.now();
        socketActions.typing(socketRef, to, chatType);
      },

      stopTyping: (to, chatType = "people") => {
        lastActivityRef.current = Date.now();
        socketActions.stopTyping(socketRef, to, chatType);
      },

      createRoom: (roomName) => {
        lastActivityRef.current = Date.now();
        socketActions.createRoom(socketRef, roomName);
      },

      joinRoom: (roomName) => {
        lastActivityRef.current = Date.now();
        socketActions.joinRoom(socketRef, roomName);
      },

      addUserToRoom: (roomName, username) => {
        lastActivityRef.current = Date.now();
        socketActions.addUserToRoom(socketRef, roomName, username);
      },

      getRoomMembers: (roomName) => {
        lastActivityRef.current = Date.now();
        socketActions.getRoomMembers(socketRef, roomName);
      },

      renameRoom: (oldName, newName) => {
        lastActivityRef.current = Date.now();
        socketActions.renameRoom(socketRef, oldName, newName);
      },

    setRoomDeputy: (roomName, username) => {
  lastActivityRef.current = Date.now();
  socketActions.setRoomDeputy(socketRef, roomName, username);
},

removeRoomDeputy: (roomName, username) => {
  lastActivityRef.current = Date.now();
  socketActions.removeRoomDeputy(socketRef, roomName, username);
},

removeRoomMember: (roomName, username) => {
  lastActivityRef.current = Date.now();
  socketActions.removeRoomMember(socketRef, roomName, username);
},

leaveRoom: (roomName, newOwnerUsername) => {
  lastActivityRef.current = Date.now();
  socketActions.leaveRoom(socketRef, roomName, newOwnerUsername);
},

      checkOnline: (username) => {
        lastActivityRef.current = Date.now();
        socketActions.checkOnline(socketRef, username);
      },

      checkExist: (username) => {
        lastActivityRef.current = Date.now();
        socketActions.checkExist(socketRef, username);
      },

      getProfile: (username) => {
        lastActivityRef.current = Date.now();
        socketActions.getProfile(socketRef, username);
      },

      updateProfile: (profile) => {
        lastActivityRef.current = Date.now();
        socketActions.updateProfile(socketRef, profile);
      },

      callInvite: (to, callType = "audio", callId, meta = {}) => {
        lastActivityRef.current = Date.now();
        socketActions.callInvite(socketRef, to, callType, callId, meta);
      },

      callAccept: (to, callId, callType = "audio", meta = {}) => {
        lastActivityRef.current = Date.now();
        socketActions.callAccept(socketRef, to, callId, callType, meta);
      },

      callReject: (to, callId, reason, meta = {}) => {
        lastActivityRef.current = Date.now();
        socketActions.callReject(socketRef, to, callId, reason, meta);
      },

      callCancel: (to, callId, meta = {}) => {
        lastActivityRef.current = Date.now();
        socketActions.callCancel(socketRef, to, callId, meta);
      },

      callEnd: (to, callId, meta = {}) => {
        lastActivityRef.current = Date.now();
        socketActions.callEnd(socketRef, to, callId, meta);
      },

      sendWebRTCOffer: (to, callId, offer, callType = "audio", meta = {}) => {
        lastActivityRef.current = Date.now();
        socketActions.sendWebRTCOffer(socketRef, to, callId, offer, callType, meta);
      },

      sendWebRTCAnswer: (to, callId, answer, callType = "audio", meta = {}) => {
        lastActivityRef.current = Date.now();
        socketActions.sendWebRTCAnswer(socketRef, to, callId, answer, callType, meta);
      },

      sendIceCandidate: (to, callId, candidate, meta = {}) => {
        socketActions.sendIceCandidate(socketRef, to, callId, candidate, meta);
      },

      removeContact: (username) => {
  lastActivityRef.current = Date.now();
  socketActions.removeContact(socketRef, username);
},

      getUserList: () => {
        lastActivityRef.current = Date.now();
        socketActions.getUserList(socketRef);
      },
    }),
    [socketRef, lastActivityRef],
  );

  return actions;
};
