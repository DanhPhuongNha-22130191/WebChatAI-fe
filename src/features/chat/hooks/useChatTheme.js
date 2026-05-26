import { useMemo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useApi } from '../../../app/providers/useApi';
import { createSettingsRepository } from '../api/settingsRepository';
import { THEMES, THEME_COMBOS } from '../constants/themeConstants';

/**
 * Hook quản lý và áp dụng Theme cho cuộc trò chuyện
 * Layer: Application
 */
export const useChatTheme = () => {
    const { actions: apiActions } = useApi();
    const activeChat = useSelector((state) => state.chat.activeChat);
    const user = useSelector((state) => state.auth.user);
    const myUsername = user?.user || user?.username || localStorage.getItem('user_name');

    const repository = useMemo(() => createSettingsRepository(apiActions), [apiActions]);

    /**
     * Áp dụng bộ màu vào CSS Variables của DOM
     */
    const applyTheme = useCallback((combo) => {
        if (!combo) return;

        const root = document.documentElement;
        root.style.setProperty('--theme-primary', combo.primary);
        root.style.setProperty('--theme-header-bg', combo.headerBg);
        root.style.setProperty('--theme-sender-bubble', combo.senderBubble);
        root.style.setProperty('--theme-text-on-primary', combo.textOnPrimary);
        root.style.setProperty('--theme-card-bg', combo.cardBg);
        root.style.setProperty('--theme-border', combo.border);
        root.style.setProperty('--theme-gradient', combo.gradient);
    }, []);

    /**
     * Tải theme từ server khi đổi cuộc trò chuyện
     */
    useEffect(() => {

        if (!activeChat) return;

        const loadTheme = async () => {
            try {
                let combo;
                // Type 0 hoặc 'people' là chat cá nhân
                if (activeChat.type === 0 || activeChat.type === 'people') {
                    combo = await repository.getChatTheme(myUsername, activeChat.name);
                }
                // Type 1 hoặc 'room'/'group' là chat nhóm
                else {
                    combo = await repository.getGroupTheme(activeChat.name);
                }

                if (combo) {
                    applyTheme(combo);
                }
            } catch (err) {
                console.error('[useChatTheme] Failed to load theme:', err);
                // Fallback đã được handle bởi repository nhưng double-check ở đây
                applyTheme(THEME_COMBOS[THEMES.DEFAULT]);
            }
        };

        loadTheme();
    }, [activeChat, myUsername, repository, applyTheme]);

    /**
     * Cập nhật theme mới
     */
    const changeTheme = useCallback(async (themeId) => {
        if (!activeChat || !myUsername) return;

        // Lưu theme cũ để revert nếu lỗi
        // Lưu ý: Chúng ta không có themeId hiện tại trong state dễ dàng, 
        // nhưng có thể lấy từ CSS variable hoặc đợi load lại.
        // Ở đây ta dùng cách tiếp cận: Nếu lỗi thì load lại từ server.

        const newCombo = THEME_COMBOS[themeId];
        if (!newCombo) return;

        // Optimistic UI: Áp dụng ngay
        applyTheme(newCombo);

        try {
            let success = false;
            // Lưu vào server dựa trên loại chat
            if (activeChat.type === 0 || activeChat.type === 'people') {
                success = await repository.updateChatTheme(myUsername, activeChat.name, themeId);
            } else {
                success = await repository.updateGroupTheme(activeChat.name, myUsername, themeId);
            }

            if (!success) {
                throw new Error('Server rejected theme update');
            }
        } catch (err) {
            console.error('[useChatTheme] Failed to persist theme:', err);
            // Revert: Cách an toàn nhất là load lại theme từ server
            const reloadTheme = async () => {
                let oldCombo;
                if (activeChat.type === 0 || activeChat.type === 'people') {
                    oldCombo = await repository.getChatTheme(myUsername, activeChat.name);
                } else {
                    oldCombo = await repository.getGroupTheme(activeChat.name);
                }
                applyTheme(oldCombo || THEME_COMBOS[THEMES.DEFAULT]);
            };
            reloadTheme();
        }
    }, [activeChat, myUsername, repository, applyTheme]);

    return {
        changeTheme,
        themes: THEME_COMBOS
    };
};
