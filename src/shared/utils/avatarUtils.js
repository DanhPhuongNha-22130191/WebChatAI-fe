/**
 * Tạo hash từ string để tạo số cố định
 * @param {string} str 
 * @returns {number}
 */
const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

/**
 * Palette màu đẹp cho avatar (màu pastel và vibrant)
 */
const AVATAR_COLORS = [
    'FF6B9D', // Pink
    '4ECDC4', // Teal
    '45B7D1', // Blue
    'FFA07A', // Light Salmon
    '98D8C8', // Mint
    'F7DC6F', // Yellow
    'BB8FCE', // Purple
    '85C1E2', // Sky Blue
    'F8B739', // Orange
    '52BE80', // Green
    'EC7063', // Coral
    '5DADE2', // Light Blue
    'F1948A', // Light Red
    '82E0AA', // Light Green
    'F4D03F', // Gold
    'AF7AC5', // Lavender
];

/**
 * Lấy màu cố định từ tên user
 * @param {string} name - Tên user
 * @returns {string} - Mã màu hex (không có #)
 */
export const getAvatarColor = (name) => {
    if (!name) return AVATAR_COLORS[0];
    const hash = hashString(name);
    const index = hash % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};

/**
 * Tạo URL avatar với màu cố định từ tên user
 * @param {string} name - Tên user
 * @param {number} size - Kích thước avatar (mặc định 128)
 * @returns {string} - URL avatar
 */
export const getAvatarUrl = (name, size = 128) => {
    if (!name) return `https://ui-avatars.com/api/?name=User&background=${AVATAR_COLORS[0]}&size=${size}`;
    const color = getAvatarColor(name);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&size=${size}`;
};
