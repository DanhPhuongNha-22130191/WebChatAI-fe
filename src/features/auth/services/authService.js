// Service Layer for Auth
// Giúp tách biệt logic gọi API/Socket khỏi Component
export const authService = {
    login: (actions, username, password) => {
        actions.login(username, password);
    },

    register: (actions, username, password) => {
        actions.register(username, password);
    },

    logout: (actions) => {
        actions.logout();
    }
};
