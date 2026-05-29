import { setUser, setError, clearError, setRegisterSuccess } from "../../state/auth/authSlice";
import { setMessages, setPeople, clearChat } from "../../state/chat/chatSlice";

const saveAuthStorage = (username, token) => {
    if (!username) return;

    sessionStorage.setItem("user_name", username);
    sessionStorage.setItem("current_user", username);

    localStorage.setItem("user_name", username);
    localStorage.setItem("current_user", username);

    if (token) {
        sessionStorage.setItem("jwt_token", token);
        sessionStorage.setItem("re_login_code", token);

        localStorage.setItem("jwt_token", token);
        localStorage.setItem("re_login_code", token);
    }
};

const clearAuthStorage = () => {
    sessionStorage.removeItem("user_name");
    sessionStorage.removeItem("current_user");
    sessionStorage.removeItem("jwt_token");
    sessionStorage.removeItem("re_login_code");
    sessionStorage.removeItem("pending_login_user");

    localStorage.removeItem("user_name");
    localStorage.removeItem("current_user");
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("re_login_code");
    localStorage.removeItem("pending_login_user");
};

export const handleAuth = (response, dispatch) => {
    console.warn("Authentication Error:", response.mes);
};

export const handleLogin = (response, dispatch) => {
    if (response.status === "success") {
        const token = response.data?.token || response.data?.RE_LOGIN_CODE;

        const pendingLoginUser =
            sessionStorage.getItem("pending_login_user") ||
            localStorage.getItem("pending_login_user");

        const username =
            response.data?.user ||
            response.data?.username ||
            response.data?.name ||
            pendingLoginUser;

        if (!username) {
            dispatch(setError("Không xác định được tài khoản đăng nhập"));
            return;
        }

        sessionStorage.setItem("user_name", username);
        sessionStorage.setItem("current_user", username);

        localStorage.setItem("user_name", username);
        localStorage.setItem("current_user", username);

        if (token) {
            sessionStorage.setItem("jwt_token", token);
            sessionStorage.setItem("re_login_code", token);

            localStorage.setItem("jwt_token", token);
            localStorage.setItem("re_login_code", token);
        }

        sessionStorage.removeItem("pending_login_user");
        localStorage.removeItem("pending_login_user");

        dispatch(setUser({
            ...response.data,
            user: username,
            username,
            name: username
        }));

        dispatch(clearError());
    } else {
        dispatch(setError(response.mes || "Đăng nhập thất bại"));
    }
};

export const handleReLogin = (response, dispatch) => {
    if (response.status === "success") {
        const token = response.data?.token || response.data?.RE_LOGIN_CODE;

        const username =
            response.data?.user ||
            response.data?.username ||
            response.data?.name ||
            sessionStorage.getItem("user_name") ||
            localStorage.getItem("user_name");

        if (!username) {
            sessionStorage.clear();
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("re_login_code");
            localStorage.removeItem("user_name");
            localStorage.removeItem("current_user");

            dispatch(setError("Phiên đăng nhập lỗi. Vui lòng đăng nhập lại."));
            dispatch(setUser(null));

            window.location.href = "/login";
            return;
        }

        sessionStorage.setItem("user_name", username);
        sessionStorage.setItem("current_user", username);

        localStorage.setItem("user_name", username);
        localStorage.setItem("current_user", username);

        if (token) {
            sessionStorage.setItem("jwt_token", token);
            sessionStorage.setItem("re_login_code", token);

            localStorage.setItem("jwt_token", token);
            localStorage.setItem("re_login_code", token);
        }

        dispatch(setUser({
            ...response.data,
            user: username,
            username,
            name: username
        }));

        dispatch(clearError());
    } else {
        console.log("Re-login thất bại, mã hết hạn hoặc lỗi.");

        sessionStorage.clear();
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("re_login_code");
        localStorage.removeItem("user_name");
        localStorage.removeItem("current_user");
        localStorage.removeItem("pending_login_user");

        dispatch(setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."));
        dispatch(setUser(null));

        window.location.href = "/login";
    }
};

export const handleRegister = (response, dispatch) => {
    if (response.status === "success") {
        dispatch(setRegisterSuccess(true));
    } else {
        dispatch(setError(response.mes || "Đăng ký lỗi"));
        dispatch(setRegisterSuccess(false));
    }
};

export const handleLogout = (response, dispatch) => {
    console.log("Đăng xuất:", response?.mes || "Logout successful");

    clearAuthStorage();

    dispatch(setUser(null));
    dispatch(setMessages([]));
    dispatch(setPeople([]));
    dispatch(clearChat());

    if (window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
};