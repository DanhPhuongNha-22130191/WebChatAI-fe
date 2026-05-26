import emoji from 'emoji-dictionary';

/**
 * Regex dùng để nhận diện emoji Unicode trong chuỗi văn bản.
 * Tham khảo:
 * - https://github.com/twitter/twemoji/tree/master/scripts
 * - Các dải ký tự Unicode tiêu chuẩn cho emoji
 */
const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;

/**
 * Mã hóa văn bản có chứa emoji Unicode thành dạng shortcode ASCII.
 * Ví dụ: "Hello 🐱" → "Hello :cat:"
 *
 * @param {string} text - Chuỗi đầu vào có chứa emoji
 * @returns {string} - Chuỗi đã được mã hóa an toàn để gửi lên BE
 */
export const encodeEmoji = (text) => {
    if (!text) return text;
    return text.replace(emojiRegex, (match) => {
        const name = emoji.getName(match);
        return name ? `:${name}:` : match;
    });
};

/**
 * Giải mã văn bản có chứa shortcode thành emoji Unicode để hiển thị trên FE.
 * Ví dụ: "Hello :cat:" → "Hello 🐱"
 *
 * @param {string} text - Chuỗi đầu vào có chứa shortcode
 * @returns {string} - Chuỗi sau khi được render emoji
 */
export const decodeEmoji = (text) => {
    if (!text) return text;
    // Nhận diện pattern :ten_emoji:
    return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, name) => {
        const unicode = emoji.getUnicode(name);
        return unicode ? unicode : match;
    });
};

/**
 * Kiểm tra xem chuỗi có phải CHỈ chứa icon/emoji (và khoảng trắng) hay không.
 * @param {string} text 
 * @returns {boolean}
 */
export const isEmojiOnly = (text) => {
    if (!text) return false;
    // Loại bỏ khoảng trắng để check
    const cleanText = text.replace(/\s/g, '');
    if (!cleanText) return false;

    // Check bằng cách replace hết emoji đi, nếu chuỗi rỗng thì là full emoji
    const remaining = cleanText.replace(emojiRegex, '');
    return remaining.length === 0;
};
