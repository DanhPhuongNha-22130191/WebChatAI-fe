import { useEffect, useRef } from 'react';
import { socketActions } from "../../../realtime/socketActions";

export const useSocketHeartbeat = (isReady, user, socketRef, lastActivityRef) => {
    const pingIntervalRef = useRef(null);

    useEffect(() => {
        if (!isReady) return;

        // Chỉ ping khi đã login (có user)
        const hasUser = user && (user.user || user.name || user.username);
        if (!hasUser) {
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = null;
            }
            return;
        }

        // --- HEARTBEAT START ---
        // Gửi ping mỗi 30s để giữ kết nối (chỉ khi idle quá lâu)
        pingIntervalRef.current = setInterval(() => {
            if (socketRef.current?.readyState !== WebSocket.OPEN) return;
            const timeSinceLastActivity = Date.now() - lastActivityRef.current;
            const IDLE_TIME_BEFORE_PING = 25000;
            if (timeSinceLastActivity >= IDLE_TIME_BEFORE_PING) {
                socketActions.ping(socketRef);
            }
        }, 30000);

        return () => {
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = null;
            }
        };
    }, [isReady, user, socketRef, lastActivityRef]);
};
