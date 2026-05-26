import { STICKER_COLLECTIONS } from './stickers';

export const STICKER_PREFIX = '[STICKER]';

/**
 * Tạo mã định danh (shortcode) cho sticker để gửi đi.
 * Định dạng kết quả: [STICKER]:<packId>:<index>
 * Ví dụ: [STICKER]:LoveHamsters:3
 * * @param {string} packId - ID của bộ sticker (ví dụ: 'LoveHamsters')
 * @param {number} index - Vị trí (index) của sticker trong mảng
 * @returns {string} Chuỗi shortcode đã được định dạng để gửi qua API
 */
export const createStickerCode = (packId, index) => {
    return `${STICKER_PREFIX}:${packId}:${index}`;
};

/**
 * Giải mã (parse) chuỗi shortcode nhận được và trả về URL ảnh thực tế.
 * * @param {string} code - Chuỗi tin nhắn cần xử lý
 * @returns {string|null} Trả về URL ảnh sticker nếu mã hợp lệ, ngược lại trả về null.
 */
export const getStickerUrl = (code) => {
    // Kiểm tra cơ bản: nếu không có code hoặc không bắt đầu bằng prefix thì bỏ qua
    if (!code || !code.startsWith(STICKER_PREFIX)) return null;

    const parts = code.split(':');
    // Cấu trúc mong đợi sau khi split: ["[STICKER]", "packId", "index"]
    // Phải đảm bảo mảng có đúng 3 phần tử
    if (parts.length !== 3) return null;

    const packId = parts[1];
    const index = parseInt(parts[2], 10);

    // Kiểm tra xem index có phải là số hợp lệ không
    if (isNaN(index)) return null;

    // Tìm bộ sticker tương ứng trong file data
    const pack = STICKER_COLLECTIONS.find(c => c.id === packId);

    // Nếu không tìm thấy bộ sticker hoặc index vượt quá số lượng ảnh thì trả về null
    if (!pack || !pack.stickers[index]) return null;

    return pack.stickers[index];
};

/**
 * Kiểm tra nhanh xem một tin nhắn có phải là sticker hay không.
 * (Dùng để quyết định render Text hay render Ảnh ở giao diện Chat)
 * * @param {string} message - Nội dung tin nhắn
 * @returns {boolean} True nếu là sticker
 */
export const isStickerMessage = (message) => {
    return message && message.startsWith(STICKER_PREFIX);
};