/* eslint-disable react-refresh/only-export-components */
// Quản lý REST API calls và cấu hình API
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { ApiContext } from "./ApiContext.js";

// API Base URL - trong dev mode dùng '/api' để đi qua proxy, production dùng env
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api"; // Production: dùng env variable

const getStoredUsername = () => {
  return (
    sessionStorage.getItem("user_name") ||
    sessionStorage.getItem("current_user") ||
    localStorage.getItem("user_name") ||
    localStorage.getItem("current_user")
  );
};

const getStoredToken = () => {
  return (
    sessionStorage.getItem("jwt_token") ||
    sessionStorage.getItem("re_login_code") ||
    localStorage.getItem("jwt_token") ||
    localStorage.getItem("re_login_code")
  );
};

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

  const username =
    user?.user || user?.username || user?.name || getStoredUsername();

  // Helper function để build full URL
  const getApiUrl = (endpoint) => {
    return endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;
  };

  const getAuthHeaders = () => {
    const token = getStoredToken();

    return token ? { Authorization: `Bearer ${token}` } : {};
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
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
              ...options.headers,
            },
            ...options,
          });

          const text = await response.text();

          let result = null;
          try {
            result = text ? JSON.parse(text) : null;
          } catch {
            result = text;
          }

          if (!response.ok) {
            console.error("API Error:", response.status, url, result);
            throw new Error(
              result?.mes ||
                result?.message ||
                result?.error ||
                result ||
                `HTTP ${response.status}`,
            );
          }

          return result;
        },

        /**
         * POST request
         */
        post: async (endpoint, data, options = {}) => {
          const url = getApiUrl(endpoint);

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
              ...options.headers,
            },
            body: JSON.stringify(data),
            ...options,
          });

          const text = await response.text();

          let result = null;
          try {
            result = text ? JSON.parse(text) : null;
          } catch {
            result = text;
          }

          if (!response.ok) {
            console.error("API Error:", response.status, url, result, data);
            throw new Error(
              result?.mes ||
                result?.message ||
                result?.error ||
                result ||
                `HTTP ${response.status}`,
            );
          }

          return result;
        },

        /**
         * PUT request
         */
        put: async (endpoint, data, options = {}) => {
          const url = getApiUrl(endpoint);

          const response = await fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
              ...options.headers,
            },
            body: JSON.stringify(data),
            ...options,
          });

          if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;

            try {
              const errorData = await response.json();
              errorMessage =
                errorData.message || errorData.error || errorMessage;
            } catch {
              const errorText = await response.text();
              if (errorText) errorMessage = errorText;
            }

            console.error(`API Error [${response.status}]:`, errorMessage);
            throw new Error(errorMessage);
          }

          return await response.json();
        },

        /**
         * PATCH request
         */
        patch: async (endpoint, data = null, options = {}) => {
          const url = getApiUrl(endpoint);

          const response = await fetch(url, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
              ...options.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
            ...options,
          });

          const text = await response.text();
          let result = null;
          try {
            result = text ? JSON.parse(text) : null;
          } catch {
            result = text;
          }

          if (!response.ok) {
            console.error("API Error:", response.status, url, result);
            throw new Error(
              result?.mes ||
                result?.message ||
                result?.error ||
                result ||
                `HTTP ${response.status}`,
            );
          }

          return result;
        },

        /**
         * DELETE request
         */
        delete: async (endpoint, options = {}) => {
          const url = getApiUrl(endpoint);

          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
              ...options.headers,
            },
            ...options,
          });

          if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;

            try {
              const errorData = await response.json();
              errorMessage =
                errorData.message || errorData.error || errorMessage;
            } catch {
              const errorText = await response.text();
              if (errorText) errorMessage = errorText;
            }

            console.error(`API Error [${response.status}]:`, errorMessage);
            throw new Error(errorMessage);
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
          const from = fromUsername || username || getStoredUsername();

          if (!from || !toUsername) {
            throw new Error("fromUsername and toUsername are required");
          }

          const response = await baseActions.post(
            "/chat/pending-conversations",
            {
              fromUsername: from,
              toUsername: toUsername,
            },
          );

          if (response?.event === "PENDING_CREATE") {
            return response.data;
          }

          return response?.data || response;
        },

        /**
         * Lấy danh sách incoming pending conversations (những người đã gửi request đến mình)
         * @param {string} targetUsername - Username của user hiện tại (optional, sẽ dùng từ context nếu không truyền)
         * @returns {Promise<Array>} Danh sách pending contacts
         */
        getIncomingPendingConversations: async (targetUsername = null) => {
    const userToQuery = targetUsername || username || getStoredUsername();

    if (!userToQuery) {
        throw new Error("Username is required");
    }

    const endpoint = `/chat/pending-conversations/incoming?username=${encodeURIComponent(userToQuery)}`;
    const response = await baseActions.get(endpoint);

    if (response?.event === "PENDING_INCOMING" && Array.isArray(response.data)) {
        return response.data;
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
          const to = toUsername || username || getStoredUsername();

          if (!fromUsername || !to) {
            throw new Error("fromUsername and toUsername are required");
          }

          const response = await baseActions.post(
            "/chat/pending-conversations/accept",
            {
              fromUsername: fromUsername,
              toUsername: to,
            },
          );

          // Parse response format: { action: "onchat", data: { event: "PENDING_ACCEPT", data: null } }
          if (
            response &&
            response.data &&
            response.data.event === "PENDING_ACCEPT"
          ) {
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
          const to = toUsername || username || getStoredUsername();

          if (!fromUsername || !to) {
            throw new Error("fromUsername and toUsername are required");
          }

          const response = await baseActions.post(
            "/chat/pending-conversations/delete",
            {
              fromUsername: fromUsername,
              toUsername: to,
            },
          );

          // Parse response format: { action: "onchat", data: { event: "PENDING_DELETE", data: null } }
          if (
            response &&
            response.data &&
            response.data.event === "PENDING_DELETE"
          ) {
            // data có thể là null hoặc object, đều coi là thành công
            return response.data.data || { success: true };
          }

          return response;
        },

        removeContact: async (friendUsername, currentUsername = null) => {
  const current = currentUsername || username || getStoredUsername();

  if (!current || !friendUsername) {
    throw new Error("currentUsername and friendUsername are required");
  }

  const response = await baseActions.post(
    "/chat/pending-conversations/remove-contact",
    {
      fromUsername: current,
      toUsername: friendUsername,
    },
  );

  return response?.data || response;
},

        // Alias cho backward compatibility
        getPendingConversations: async (targetUsername = null) => {
          return baseActions.getIncomingPendingConversations(targetUsername);
        },
      };
    },
    [username], // Re-create actions khi username thay đổi
  );

  // Giá trị cung cấp cho toàn bộ component con
  const value = useMemo(
    () => ({
      actions: apiActions,
      apiBaseUrl: API_BASE_URL,
      username, // Có thể dùng trong components nếu cần
      envInfo: getEnvironmentInfo(), // Thông tin environment
    }),
    [apiActions, username],
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
