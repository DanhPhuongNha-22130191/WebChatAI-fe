 /**
 * Repository cho tính năng Pending Conversation
 * Layer: Infrastructure (Feature-scoped)
 * Nhiệm vụ: Đóng gói việc gọi ApiProvider, định nghĩa endpoint và chuyển đổi dữ liệu (Mapping)
 */

export const createPendingRepository = (apiActions) => {
    return {
        /**
         * Lấy danh sách yêu cầu chờ (Đã map về định dạng sạch cho UI)
         */
       getIncomingRequests: async (username) => {
    const data = await apiActions.getIncomingPendingConversations(username);

    return (data || [])
        .filter(item => item.status === "PENDING")
        .map(item => ({
            id: item.id,
            username: item.fromUsername,
            fromUsername: item.fromUsername,
            toUsername: item.toUsername,
            status: item.status,
            createdAt: item.createdAt,
        }));
},
        /**
         * Chấp nhận yêu cầu
         */
        acceptRequest: async (fromUsername) => {
            return await apiActions.acceptPendingConversation(fromUsername);
        },

        /**
         * Từ chối/Xóa yêu cầu
         */
        deleteRequest: async (fromUsername) => {
            return await apiActions.deletePendingConversation(fromUsername);
        },

        removeContact: async (friendUsername) => {
    return await apiActions.removeContact(friendUsername);
},

        /**
         * Tạo yêu cầu mới
         */
        createRequest: async (toUsername) => {
            const response = await apiActions.createPendingConversation(toUsername);

            // Logic kiểm tra tính hợp lệ của response nằm ở đây thay vì ở Page
            if (response && (response.status === 'PENDING' || response.id)) {
                return response;
            }

            throw new Error('Response không hợp lệ từ server khi tạo yêu cầu liên hệ');
        }
    };
};
