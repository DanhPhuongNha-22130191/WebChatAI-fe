/**
 * Repository quản lý cấu hình cuộc trò chuyện (Settings/Theme)
 * Layer: Infrastructure (Feature-scoped)
 */
import { THEMES, THEME_COMBOS } from '../constants/themeConstants';

export const createSettingsRepository = (apiActions) => {
    return {
        /**
         * Lấy Theme của cuộc trò chuyện giữa 2 người
         */
        getChatTheme: async (user1, user2) => {
            try {
                const response = await apiActions.get(
                    `/chat/settings/theme?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`
                );


                const themeId = response?.data?.data || response?.data?.payload;

                if (themeId && THEME_COMBOS[themeId]) {
                    return THEME_COMBOS[themeId];
                }

                return THEME_COMBOS[THEMES.DEFAULT];
            } catch (err) {
                console.error('[SettingsRepo] Failed to get theme:', err);
                return THEME_COMBOS[THEMES.DEFAULT];
            }
        },

        /**
         * Lấy Theme của Nhóm
         */
        getGroupTheme: async (groupName) => {
            try {
                const response = await apiActions.get(
                    `/chat/settings/group?groupName=${encodeURIComponent(groupName)}`
                );

                // Group API trả về object chứa themeId
                const themeData = response?.data?.data;
                const themeId = typeof themeData === 'object' ? themeData?.themeId : themeData;

                if (themeId && THEME_COMBOS[themeId]) {
                    return THEME_COMBOS[themeId];
                }

                return THEME_COMBOS[THEMES.DEFAULT];
            } catch (err) {
                console.error('[SettingsRepo] :', err);
                return THEME_COMBOS[THEMES.DEFAULT];
            }
        },

        /**
         * Cập nhật Theme
         */
        updateChatTheme: async (user1, user2, themeId) => {
            try {
                const response = await apiActions.post('/chat/settings/theme', {
                    userOne: user1,
                    userTwo: user2,
                    themeId: themeId
                });

                const respData = response?.data || {};
                const respThemeId = respData.data || respData.payload;

                return respThemeId === themeId || respData.event === 'SET_THEME_SUCCESS';
            } catch (err) {
                console.error('[SettingsRepo]:', err);
                return false;
            }
        },

        /**
         * Cập nhật Theme Nhóm
         */
        updateGroupTheme: async (groupName, username, themeId) => {
            try {
                const response = await apiActions.post('/chat/settings/group', {
                    groupName,
                    username,
                    themeId
                });

                const respData = response?.data || {};
                const themeData = respData.data;
                const respThemeId = typeof themeData === 'object' ? themeData?.themeId : themeData;

                return respThemeId === themeId || respData.event === 'SET_GROUP_THEME_SUCCESS';
            } catch (err) {
                console.error('[SettingsRepo]:', err);
                return false;
            }
        }
    };
};
