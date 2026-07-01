const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

const getStoredToken = () => {
    return (
        sessionStorage.getItem('jwt_token') ||
        sessionStorage.getItem('re_login_code') ||
        localStorage.getItem('jwt_token') ||
        localStorage.getItem('re_login_code')
    );
};

const readJsonSafely = async (response) => {
    const text = await response.text();

    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        throw new Error(
            `Backend không trả JSON. Response nhận được: ${text.substring(0, 300)}`
        );
    }
};

const makeFriendlyAiError = (message, status) => {
    const rawMessage = message || '';
    const lowerMessage = rawMessage.toLowerCase();

    if (
        status === 429 ||
        rawMessage.includes('HTTP 429') ||
        lowerMessage.includes('quota') ||
        lowerMessage.includes('rate limit')
    ) {
        return 'AI hiện đã hết quota hoặc vượt giới hạn sử dụng. Vui lòng thử lại sau hoặc đổi API key Gemini khác.';
    }

    if (
        status === 503 ||
        rawMessage.includes('HTTP 503') ||
        lowerMessage.includes('high demand') ||
        lowerMessage.includes('overloaded') ||
        lowerMessage.includes('unavailable')
    ) {
        return 'AI hiện đang quá tải. Vui lòng thử lại sau vài phút.';
    }

    if (
        status === 403 ||
        rawMessage.includes('HTTP 403') ||
        lowerMessage.includes('denied access') ||
        lowerMessage.includes('permission')
    ) {
        return 'API key Gemini không có quyền truy cập hoặc project bị từ chối. Vui lòng kiểm tra lại API key.';
    }

    if (
        status === 400 ||
        rawMessage.includes('HTTP 400') ||
        lowerMessage.includes('api key not valid') ||
        lowerMessage.includes('invalid api key')
    ) {
        return 'API key Gemini không hợp lệ. Vui lòng kiểm tra lại key trong backend.';
    }

    if (
        rawMessage.includes('Chưa cấu hình GEMINI_API_KEY') ||
        lowerMessage.includes('gemini_api_key')
    ) {
        return 'Backend chưa cấu hình GEMINI_API_KEY. Vui lòng thêm API key Gemini rồi chạy lại backend.';
    }

    if (rawMessage) {
        return rawMessage;
    }

    return `Không thể tóm tắt cuộc trò chuyện. Mã lỗi: ${status}`;
};

export const summarizeChat = async ({
    type,
    target,
    period = 'latest',
    mode = 'general',
    limit = 50,
    from,
    to,
    force = false
}) => {
    if (!type || !target) {
        throw new Error('Thiếu thông tin cuộc trò chuyện cần tóm tắt.');
    }

    const token = getStoredToken();

    const params = new URLSearchParams({
        type,
        target,
        period,
        mode,
        limit: String(limit),
        force: String(force)
    });

    if (period === 'range') {
        if (!from || !to) {
            throw new Error('Vui lòng chọn ngày bắt đầu và ngày kết thúc.');
        }

        params.append('from', from);
        params.append('to', to);
    }

    const response = await fetch(`${API_BASE_URL}/chat/summary?${params.toString()}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });

    const result = await readJsonSafely(response);

    if (!response.ok) {
        const backendMessage =
            result?.mes ||
            result?.message ||
            result?.error ||
            result?.data?.message ||
            '';

        throw new Error(makeFriendlyAiError(backendMessage, response.status));
    }

    return result?.data || result;
};