import { useState, useEffect, useRef, useCallback } from 'react';
import { socketActions } from "../../../realtime/socketActions";
import { handleSocketMessage } from "../../../realtime/socketHandlers";
import { store } from '../../store';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8081/api/ws';
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_DELAY = 3000;

export const useSocketConnection = (dispatch, lastActivityRef, isOnline) => {
    const socketRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    // Kích hoạt reset kết nối
    const [retryTrigger, setRetryTrigger] = useState(0);

    // Refs cho trạng thái nội bộ để tránh re-render hoặc stale closures trong callbacks
    const isConnectingRef = useRef(false);
    const reconnectTimeoutRef = useRef(null);
    // Theo dõi số lần thử lại kết nối nội bộ
    const reconnectAttemptsRef = useRef(0);

    // Xử lý chuyển đổi Online/Offline từ prop của hook
    useEffect(() => {
        if (isOnline) {
            console.log("Mạng đã có trở lại, reconnecting...");
            reconnectAttemptsRef.current = 0;
            setConnectionError(null);
            setRetryTrigger(prev => prev + 1); // Kích hoạt kết nối
        } else {
            console.log("Đã mất kết nối mạng.");
            setIsReady(false);
            setConnectionError("Mất kết nối Internet. Vui lòng kiểm tra đường truyền.");
            if (socketRef.current) {
                socketRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        }
    }, [isOnline]);

    useEffect(() => {
        // Nếu hiện đang offline, không thử kết nối qua effect này

        const connect = () => {
            if (!navigator.onLine) {
                console.log('Mất kết nối mạng, dừng connect.');
                setIsReady(false);
                setConnectionError("Mất kết nối Internet. Vui lòng kiểm tra đường truyền.");
                return;
            }

            setConnectionError(null);

            if (isConnectingRef.current || (socketRef.current && socketRef.current.readyState === WebSocket.CONNECTING)) {
                console.log('Đang kết nối, bỏ qua...');
                return;
            }

            // Đóng socket cũ
            if (socketRef.current) {
                const oldSocket = socketRef.current;
                oldSocket.onopen = null;
                oldSocket.onclose = null;
                oldSocket.onerror = null;
                oldSocket.onmessage = null;
                if (oldSocket.readyState === WebSocket.OPEN || oldSocket.readyState === WebSocket.CONNECTING) {
                    oldSocket.close();
                }
            }

            isConnectingRef.current = true;
            const socket = new WebSocket(WS_URL);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log('WebSocket da ket noi');
                isConnectingRef.current = false;
                setIsReady(true);
                setConnectionError(null);
                lastActivityRef.current = Date.now();
                reconnectAttemptsRef.current = 0;

                // Logic đăng nhập lại (Re-login)
                const code = localStorage.getItem('re_login_code');
                const savedUser = localStorage.getItem('user_name');
                const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

                if (code && savedUser && !isAuthPage) {
                    console.log(`Phát hiện phiên cũ của [${savedUser}], đang Re-login...`);
                    socketActions.reLogin(socketRef, savedUser, code);
                } else {
                    console.log("Không tìm thấy phiên cũ hoặc đang ở trang Auth.");
                }
            };

            socket.onmessage = (event) => {
                try {
                    const response = JSON.parse(event.data);
                    lastActivityRef.current = Date.now();

                    const silentEvents = ["GET_USER_LIST", "CHECK_USER_ONLINE"]; // Removed SEND_CHAT from silent
                    if (response.event === "SEND_CHAT") {
                        console.log("SERVER RETURN:", response.data ? response.data.mes : "No data");
                    }
                    if (!silentEvents.includes(response.event)) {
                        console.log("[Socket] Nhận:", response.event, response);
                    }
                    handleSocketMessage(response, dispatch, socketActions, socketRef, () => store.getState());
                } catch (err) {
                    console.error("Lỗi parse JSON:", err, "Raw data:", event.data);
                }
            };

            socket.onclose = (event) => {
                console.log('WebSocket da ngat ket noi. Code:', event.code, 'Reason:', event.reason);
                isConnectingRef.current = false;
                setIsReady(false);

                // Nếu mất mạng (phát hiện bởi trình duyệt) thì không thử lại kiểu lũy thừa
                if (!navigator.onLine) {
                    setConnectionError("Mất kết nối Internet. Vui lòng kiểm tra đường truyền.");
                    return;
                }

                if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                    const delay = Math.min(BASE_DELAY * Math.pow(2, reconnectAttemptsRef.current), 30000);
                    reconnectAttemptsRef.current++;

                    console.log(`Thu ket noi lai sau ${delay}ms (lan thu ${reconnectAttemptsRef.current})...`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, delay);
                } else {
                    console.error('Đã vượt quá số lần reconnect tối đa');
                    setConnectionError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền.");
                }
            };

            socket.onerror = (err) => {
                console.error("WebSocket lỗi:", err);
                isConnectingRef.current = false;
                setIsReady(false);
                if (socket.readyState === WebSocket.OPEN) {
                    socket.close();
                }
            };
        };

        connect();

        return () => {
            isConnectingRef.current = false;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            if (socketRef.current) {
                socketRef.current.onclose = null;
                socketRef.current.onerror = null;
                socketRef.current.onmessage = null;
                socketRef.current.onopen = null;

                if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
                    socketRef.current.close(1000, 'Component unmounting');
                }
                socketRef.current = null;
            }
        };
    }, [dispatch, retryTrigger, lastActivityRef]);

    const reconnect = useCallback(() => {
        setRetryTrigger(prev => prev + 1);
    }, []);

    return { socketRef, isReady, connectionError, reconnect };
};
