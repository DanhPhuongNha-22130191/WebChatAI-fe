import { useMemo } from 'react';
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

            chatHistory: (to, page = 1) => {
                lastActivityRef.current = Date.now();
                socketActions.chatHistory(socketRef, to, page);
            },

            roomHistory: (roomName, page = 1) => {
                lastActivityRef.current = Date.now();
                socketActions.roomHistory(socketRef, roomName, page);
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

            leaveRoom: (roomName) => {
                lastActivityRef.current = Date.now();
                socketActions.leaveRoom(socketRef, roomName);
            },

            checkOnline: (username) => {
                lastActivityRef.current = Date.now();
                socketActions.checkOnline(socketRef, username);
            },

            checkExist: (username) => {
                lastActivityRef.current = Date.now();
                socketActions.checkExist(socketRef, username);
            },

            getUserList: () => {
                lastActivityRef.current = Date.now();
                socketActions.getUserList(socketRef);
            }
        }),
        [socketRef, lastActivityRef]
    );

    return actions;
};
