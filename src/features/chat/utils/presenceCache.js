
const presenceCache = new Map();

// Thời gian tối thiểu giữa 2 lần check cho cùng 1 user (10 phút)
const CACHE_TTL_MS = 10 * 60 * 1000; 

export const PresenceCache = {

    shouldCheck(username) {
        if (!username) return false;
        
        const lastCheck = presenceCache.get(username);
        const now = Date.now();

        // Nếu chưa check bao giờ -> CHECK
        if (!lastCheck) return true;

        // Nếu đã check nhưng quá thời gian TTL -> CHECK
        if (now - lastCheck > CACHE_TTL_MS) return true;

        // Cache còn mới -> SKIP
        return false;
    },

    /**
     * Đánh dấu user đã được gửi request check online.
     * @param {string} username 
     */
    markAsChecked(username) {
        if (username) {
            presenceCache.set(username, Date.now());
        }
    },

    /**
     * Xóa cache của 1 user (dùng khi muốn force refresh thủ công)
     */
    invalidate(username) {
        presenceCache.delete(username);
    },

    /**
     * Debug only: Lấy size của cache
     */
    getSize() {
        return presenceCache.size;
    }
};
