/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';

export const useChatPresence = ( activeChat) => {
    // Việc check online status giờ đây là trách nhiệm duy nhất của Sidebar (useChatSidebar).

    useEffect(() => {
        // Debug log để verify rằng hook này không làm gì cả
    }, [activeChat?.name]);
};
