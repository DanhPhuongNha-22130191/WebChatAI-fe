// Quản lý kết nối và giữ kho dữ liệu (State)
import React, { useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from './SocketContext.js';

// Hooks
import { useNetworkStatus } from '../../shared/hooks/useNetworkStatus';
import { useSocketConnection } from './hooks/useSocketConnection';
import { useSocketHeartbeat } from './hooks/useSocketHeartbeat';
import { useSocketActions } from './hooks/useSocketActions';

// Tạo provider
export const SocketProvider = ({ children }) => {
    // 1. Quản lý trạng thái mạng
    const isOnline = useNetworkStatus();

    // REDUX DISPATCH & User
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    // Ref lưu thời gian hoạt động cuối (cho cả Heartbeat + Actions)
    const lastActivityRef = useRef(Date.now());

    // 2. Quản lý kết nối lõi (connect, retry, error)
    const {
        socketRef,
        isReady,
        connectionError,
        reconnect
    } = useSocketConnection(dispatch, lastActivityRef, isOnline);

    // 3. Quản lý nhịp tim (Ping)
    useSocketHeartbeat(isReady, user, socketRef, lastActivityRef);

    // 4. Lấy danh sách actions
    const actions = useSocketActions(socketRef, lastActivityRef);

    // Gia tri cung cap cho toan bo component con
    const value = useMemo(() => ({
        isReady,
        actions,
        connectionError,
        reconnect
    }), [isReady, actions, connectionError, reconnect]);

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
