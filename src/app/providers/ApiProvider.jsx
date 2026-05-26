/* eslint-disable react-refresh/only-export-components */
// Quản lý REST API calls và cấu hình API
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ApiContext } from './ApiContext.js';

// API Base URL - trong dev mode dùng '/api' để đi qua proxy, production dùng env
const envApiUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = import.meta.env.DEV
    ? '/api'  // Dev mode: dùng relative path để đi qua Vite proxy tránh CORS
    : (envApiUrl || '/api');  // Production: dùng env variable

// Utility function để kiểm tra environment
export const getEnvironmentInfo = () => {
    const envApiUrl = import.meta.env.VITE_API_BASE_URL;

    return {
        mode: import.meta.env.MODE,
        apiBaseUrl: API_BASE_URL,
        envApiUrl: envApiUrl || null,
    };
};
// Tạo provider
export const ApiProvider = ({ children }) => {
    // Lấy user từ Redux Store để có thể dùng cho authentication
    const user = useSelector((state) => state.auth.user);
    const username = user?.user || user?.username || localStorage.getItem('user_name');

    // Helper function để build full URL
    const getApiUrl = (endpoint) => {
        return endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    };

    // API Client methods
    const apiActions = useMemo(
        () => {
            // Base methods
            const baseActions = {
                /**
                 * GET request
                 */
                get: async (endpoint, options = {}) => {
                    const url = getApiUrl(endpoint);

                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            ...options.headers,
                        },
                        ...options,
                    });

                    if (!response.ok) {
                        let errorMessage = `HTTP error! status: ${response.status}`;
                        try {
                            const errorData = await response.json();
                            errorMessage = errorData.message || errorData.error || errorMessage;
                        } catch{
                            const errorText = await response.text();
                            if (errorText) errorMessage = errorText;
                        }
                        console.error(`API Error [${response.status}]:`, errorMessage);
                        throw new Error(errorMessage);
                    }

                    return await response.json();
                },

                /**
                 * POST request
                 */
                post: async (endpoint, data, options = {}) => {
                    const url = getApiUrl(endpoint);

                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...options.headers,
                        },
                        body: JSON.stringify(data),
                        ...options,
                    });

                    if (!response.ok) {
                        let errorMessage = `HTTP error! status: ${response.status}`;
                        try {
                            const errorData = await response.json();
                            errorMessage = errorData.message || errorData.error || errorMessage;
                        } catch {
                            const errorText = await response.text();
                            if (errorText) errorMessage = errorText;
                        }
                        console.error(`API Error [${response.status}]:`, errorMessage, 'URL:', url, 'Data:', data);
                        throw new Error(errorMessage);
                    }

                    return await response.json();
                },

                /**
                 * PUT request
                 */
                put: async (endpoint, data, options = {}) => {
                    const url = getApiUrl(endpoint);

                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            ...options.headers,
                        },
                        body: JSON.stringify(data),
                        ...options,
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    return await response.json();
                },

                /**
                 * DELETE request
                 */
                delete: async (endpoint, options = {}) => {
                    const url = getApiUrl(endpoint);

                    const response = await fetch(url, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            ...options.headers,
                        },
                        ...options,
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    return await response.json();
                },
            };

            // Pending Conversations API methods
            return {
                ...baseActions,

                /**
                 * Tạo pending conversation (A gửi yêu cầu đến B)
                 * @param {string} toUsername - Username của người nhận
                 * @param {string} fromUsername - Username của người gửi (optional, sẽ dùng từ context nếu không truyền)
                 * @returns {Promise<Object>} Response từ server
                 */
                createPendingConversation: async (toUsername, fromUsername = null) => {
                    const from = fromUsername || username;
                    if (!from || !toUsername) {
                        throw new Error('fromUsername and toUsername are required');
                    }

                    const response = await baseActions.post('/chat/pending-conversations', {
                        fromUsername: from,
                        toUsername: toUsername,
                    });

                    // Parse response format: { action: "onchat", data: { event: "PENDING_CREATE", data: {...} } }
                    if (response && response.data && response.data.event === 'PENDING_CREATE' && response.data.data) {
                        return response.data.data;
                    }

                    return response;
                },

                /**
                 * Lấy danh sách incoming pending conversations (những người đã gửi request đến mình)
                 * @param {string} targetUsername - Username của user hiện tại (optional, sẽ dùng từ context nếu không truyền)
                 * @returns {Promise<Array>} Danh sách pending contacts
                 */
                getIncomingPendingConversations: async (targetUsername = null) => {
                    const userToQuery = targetUsername || username;
                    if (!userToQuery) {
                        throw new Error('Username is required');
                    }

                    const endpoint = `/chat/pending-conversations/incoming?username=${encodeURIComponent(userToQuery)}`;
                    const response = await baseActions.get(endpoint);

                    // Parse response format: { action: "onchat", data: { event: "PENDING_INCOMING", data: [...] } }
                    if (response && response.data && response.data.event === 'PENDING_INCOMING' && Array.isArray(response.data.data)) {
                        return response.data.data;
                    }

                    // Fallback: nếu không đúng format trên, thử parse như cũ
                    if (Array.isArray(response)) {
                        return response;
                    }
                    if (response.success && Array.isArray(response.data)) {
                        return response.data;
                    }
                    if (Array.isArray(response.pendingConversations)) {
                        return response.pendingConversations;
                    }

                    return [];
                },

                /**
                 * Accept pending conversation (B chấp nhận request từ A)
                 * @param {string} fromUsername - Username của người đã gửi request
                 * @param {string} toUsername - Username của người nhận (optional, sẽ dùng từ context nếu không truyền)
                 * @returns {Promise<Object>} Response từ server
                 */
                acceptPendingConversation: async (fromUsername, toUsername = null) => {
                    const to = toUsername || username;
                    if (!fromUsername || !to) {
                        throw new Error('fromUsername and toUsername are required');
                    }

                    const response = await baseActions.post('/chat/pending-conversations/accept', {
                        fromUsername: fromUsername,
                        toUsername: to,
                    });

                    // Parse response format: { action: "onchat", data: { event: "PENDING_ACCEPT", data: null } }
                    if (response && response.data && response.data.event === 'PENDING_ACCEPT') {
                        // data có thể là null hoặc object, đều coi là thành công
                        return response.data.data || { success: true };
                    }

                    return response;
                },

                /**
                 * Delete pending conversation (B từ chối request từ A)
                 * @param {string} fromUsername - Username của người đã gửi request
                 * @param {string} toUsername - Username của người nhận (optional, sẽ dùng từ context nếu không truyền)
                 * @returns {Promise<Object>} Response từ server
                 */
                deletePendingConversation: async (fromUsername, toUsername = null) => {
                    const to = toUsername || username;
                    if (!fromUsername || !to) {
                        throw new Error('fromUsername and toUsername are required');
                    }

                    const response = await baseActions.post('/chat/pending-conversations/delete', {
                        fromUsername: fromUsername,
                        toUsername: to,
                    });

                    // Parse response format: { action: "onchat", data: { event: "PENDING_DELETE", data: null } }
                    if (response && response.data && response.data.event === 'PENDING_DELETE') {
                        // data có thể là null hoặc object, đều coi là thành công
                        return response.data.data || { success: true };
                    }

                    return response;
                },

                // Alias cho backward compatibility
                getPendingConversations: async (targetUsername = null) => {
                    return baseActions.getIncomingPendingConversations(targetUsername);
                },
            };
        },
        [username] // Re-create actions khi username thay đổi
    );

    // Giá trị cung cấp cho toàn bộ component con
    const value = useMemo(
        () => ({
            actions: apiActions,
            apiBaseUrl: API_BASE_URL,
            username, // Có thể dùng trong components nếu cần
            envInfo: getEnvironmentInfo(), // Thông tin environment
        }),
        [apiActions, username]
    );

    return (
        <ApiContext.Provider value={value}>
            {children}
        </ApiContext.Provider>
    );
};