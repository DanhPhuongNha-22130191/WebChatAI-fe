import { useMemo, useRef } from 'react';
import { socketActions } from "../../../realtime/socketActions";

export const useSocketActions = (socketRef, lastActivityRef) => {
    const actions = useMemo(
        () => ({
            login: (u, p) => {
                lastActivityRef.current = Date.now();
                socketActions.login(socketRef, u, p);
            },
            register: (u, p) => {
                lastActivityRef.current = Date.now();
                socketActions.register(socketRef, u, p);
            },
            sendChat: (to, mes, chatType = "people") => {
                lastActivityRef.current = Date.now();
                socketActions.sendChat(socketRef, to, mes, chatType);
            },
            chatHistory: (to, page) => {
                lastActivityRef.current = Date.now();
                socketActions.chatHistory(socketRef, to, page);
            },
            roomHistory: (room, page) => {
                lastActivityRef.current = Date.now();
                socketActions.roomHistory(socketRef, room, page);
            },
            createRoom: (name) => {
                lastActivityRef.current = Date.now();
                socketActions.createRoom(socketRef, name);
            },
            joinRoom: (name) => {
                lastActivityRef.current = Date.now();
                socketActions.joinRoom(socketRef, name);
            },
            checkOnline: (name) => {
                lastActivityRef.current = Date.now();
                socketActions.checkOnline(socketRef, name);
            },
            checkExist: (name) => {
                lastActivityRef.current = Date.now();
                socketActions.checkExist(socketRef, name);
            },
            getUserList: () => {
                lastActivityRef.current = Date.now();
                socketActions.getUserList(socketRef);
            },
            logout: () => {
                lastActivityRef.current = Date.now();
                socketActions.logout(socketRef);
            },
            reLogin: (savedUser, code) => {
                lastActivityRef.current = Date.now();
                socketActions.reLogin(socketRef, savedUser, code);
            }
        }),
        [socketRef, lastActivityRef]
    );

    return actions;
};
