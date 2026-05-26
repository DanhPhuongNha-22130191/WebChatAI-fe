import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook chuyên biệt xử lý cuộn trong ChatBox
 */
export const useChatScroll = (messages, page, isLoading, hasMore) => {
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const prevScrollHeightRef = useRef(0);

    const scrollToBottom = useCallback((behavior = 'auto') => {
        requestAnimationFrame(() => {
            if (chatContainerRef.current) {
                const { scrollHeight } = chatContainerRef.current;
                chatContainerRef.current.scrollTo({
                    top: scrollHeight,
                    behavior
                });
            }
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
            }
        });
    }, []);

    // Effect: Xử lý cuộn khi dữ liệu tin nhắn về (Load more vs Trang đầu)
    useEffect(() => {
        if (!isLoading) return;

        if (page === 1) {
            if (messages.length > 0) {
                setTimeout(() => scrollToBottom('auto'), 50);
            }
        } else {
            // Load more: Giữ vị trí scroll cũ
            if (chatContainerRef.current && messages.length > 0) {
                const newScrollHeight = chatContainerRef.current.scrollHeight;
                chatContainerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current;
            }
        }
    }, [messages.length, page, isLoading, scrollToBottom]);

    // Effect: Tự động scroll xuống khi có tin nhắn mới (chỉ khi đang ở gần cuối)
    useEffect(() => {
        if (messages.length > 0 && page === 1 && chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

            if (isNearBottom) {
                scrollToBottom('smooth');
            }
        }
    }, [messages.length, page, scrollToBottom]);

    const captureScrollHeight = useCallback(() => {
        if (chatContainerRef.current) {
            prevScrollHeightRef.current = chatContainerRef.current.scrollHeight;
        }
    }, []);

    return {
        messagesEndRef,
        chatContainerRef,
        scrollToBottom,
        captureScrollHeight
    };
};
