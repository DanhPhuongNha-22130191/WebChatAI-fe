import { setUser, setError, clearError, setRegisterSuccess } from "../../state/auth/authSlice";
import { setMessages, setPeople } from "../../state/chat/chatSlice";

export const handleAuth = (response, dispatch) => {
    // Server bao loi authen, co the do goi API can login ma user chua login
    console.warn("Authentication Error:", response.mes);
};

export const handleLogin = (response, dispatch) => {
    if (response.status === "success") {
        console.log("Đăng nhập thành công, Code:", response.data?.RE_LOGIN_CODE);

        // luu code vao localStorage
        if (response.data.RE_LOGIN_CODE) {
            localStorage.setItem('re_login_code', response.data.RE_LOGIN_CODE);
        }
        // lay user name da luu o localStorage
        const currentName = localStorage.getItem('user_name') || "User";

        dispatch(setUser({
            ...response.data, // Copy tất cả những gì server trả về
            name: currentName // bo sung name
        }));

        dispatch(clearError());
    } else {
        dispatch(setError(response.mes || "Đăng nhập thất bại"));
    }
};

export const handleReLogin = (response, dispatch) => {
    if (response.status === "success") {
        if (response.data?.RE_LOGIN_CODE) {
            localStorage.setItem('re_login_code', response.data.RE_LOGIN_CODE);
        }

        // Ưu tiên lấy tên từ Server trả về, nếu không có thì giữ nguyên tên cũ trong LocalStorage
        const serverUser = response.data.user;
        const localUser = localStorage.getItem('user_name');

        // Chỉ cập nhật vào storage nếu server thực sự trả về tên mới
        if (serverUser) {
            localStorage.setItem('user_name', serverUser);
        }
        // Set State (Kết hợp dữ liệu server và tên đang có)
        // Dùng (serverUser || localUser) để đảm bảo không bị mất tên
        dispatch(setUser({
            ...response.data,
            name: serverUser || localUser || "User"
        }));

        dispatch(clearError());
    } else {
        console.log("Re-login thất bại, mã hết hạn hoặc lỗi.");
        localStorage.removeItem('re_login_code');
        localStorage.removeItem('user_name');
        dispatch(setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."));
        dispatch(setUser(null));
        // Dùng window.location vì ở đây không có hook navigate
        window.location.href = '/login';
    }
};

export const handleRegister = (response, dispatch) => {
    if (response.status === "success") {
        // Set state báo đăng ký thành công
        dispatch(setRegisterSuccess(true));
    } else {
        dispatch(setError(response.mes || "Đăng ký lỗi"));
        dispatch(setRegisterSuccess(false));
    }
};

export const handleLogout = (response, dispatch) => {
    // Xóa thông tin đăng nhập local
    localStorage.removeItem('re_login_code');
    localStorage.removeItem('user_name');
    // Reset state user về null để kích hoạt chuyển hướng
    dispatch(setUser(null));
    dispatch(setMessages([])); // Clear tin nhắn cũ
    dispatch(setPeople([]));// Clear danh sách user
};
