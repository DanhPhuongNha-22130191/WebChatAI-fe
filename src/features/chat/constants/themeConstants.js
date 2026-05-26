/**
 * Cấu hình các bộ màu (Color Combos) cho hệ thống Chat
 * Layer: Domain (Constants)
 */

export const THEMES = {
    DEFAULT: 'DEFAULT',
    OCEAN_BLUE: 'OCEAN_BLUE',
    FOREST_GREEN: 'FOREST_GREEN',
    SUNSET_ORANGE: 'SUNSET_ORANGE',
    DEEP_PURPLE: 'DEEP_PURPLE',
};

/**
 * ĐỊNH NGHĨA CÁC COMBO MÀU
 * Mỗi combo bao gồm:
 * - primary: Màu chủ đạo cho nút, icon
 * - headerBg: Màu nền của thanh Header chat
 * - senderBubble: Màu nền của tin nhắn bạn gửi đi
 * - textOnPrimary: Màu chữ hiển thị trên nền primary/headerBg
 * - cardBg: Màu nền của panel bên phải (Info) và sidebar
 */
export const THEME_COMBOS = {
    [THEMES.DEFAULT]: {
        name: 'Hồng mặc định',
        primary: '#7A003C',
        headerBg: '#FF5596',
        senderBubble: '#FF5596',
        textOnPrimary: '#FFFFFF',
        cardBg: '#FFDAEB',
        border: '#FFB3D9',
        gradient: 'linear-gradient(135deg, #FFB2CD 0%, #FF5BCB 100%)',
    },
    [THEMES.OCEAN_BLUE]: {
        name: 'Đại dương xanh',
        primary: '#0056b3',
        headerBg: '#007bff',
        senderBubble: '#007bff',
        textOnPrimary: '#FFFFFF',
        cardBg: '#e7f1ff',
        border: '#b3d7ff',
        gradient: 'linear-gradient(135deg, #6fb1fc 0%, #4364f7 100%)',
    },
    [THEMES.FOREST_GREEN]: {
        name: 'Rừng xanh',
        primary: '#1e7e34',
        headerBg: '#28a745',
        senderBubble: '#28a745',
        textOnPrimary: '#FFFFFF',
        cardBg: '#eafaf1',
        border: '#d4edda',
        gradient: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)',
    },
    [THEMES.SUNSET_ORANGE]: {
        name: 'Hoàng hôn',
        primary: '#d35400',
        headerBg: '#e67e22',
        senderBubble: '#e67e22',
        textOnPrimary: '#FFFFFF',
        cardBg: '#fef5e7',
        border: '#f5c6cb',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    [THEMES.DEEP_PURPLE]: {
        name: 'Tím mộng mơ',
        primary: '#6f42c1',
        headerBg: '#8e44ad',
        senderBubble: '#8e44ad',
        textOnPrimary: '#FFFFFF',
        cardBg: '#f4ecf7',
        border: '#d7bde2',
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    },
};

/**
 * HƯỚNG DẪN THÊM THEME MỚI (COMBO MÀU):
 * 1. Thêm một ID mới vào object `THEMES` ở trên (ví dụ: NEON_LIGHT: 'NEON_LIGHT').
 * 2. Thêm cấu hình màu tương ứng vào `THEME_COMBOS` với key là ID bạn vừa tạo.
 * 3. Hệ thống sẽ tự động cập nhật trong danh sách chọn màu.
 */
