import { setPeople, setOnlineStatus, updateProfileInPeople } from "../../state/chat/chatSlice";
import { setError, setUser } from "../../state/auth/authSlice";


export const handleGetUserList = (response, dispatch) => {
    if (response.status === 'success' && Array.isArray(response.data)) {
        dispatch(setPeople(response.data));
    } else {
        // Nếu lỗi (chưa login), không set để tránh overwrite list cũ
        console.warn("GET_USER_LIST thất bại:", response.mes || response.status);
    }
};

export const handleCheckUserOnline = (response, dispatch) => {
    console.log("[Socket Handler] CHECK_USER_ONLINE response:", response);

    if (response.status === 'success' && response.data) {
        // Fallback: Nếu response.data.user bị null hoặc undefined, dùng giá trị đã lưu trong window khi gửi request
        const userName = response.data.user || window.__pendingCheckOnline;
        const isOnline = response.data.status === true || response.data.status === 'true';

        console.log(`[Socket Handler] Updating online status for [${userName}]: ${isOnline}`);

        if (userName) {
            dispatch(setOnlineStatus({
                user: userName,
                isOnline: isOnline
            }));
        } else {
            console.warn("[Socket Handler] Cannot determine user name for online status update");
        }
    }
};

export const handleCheckUserExist = (response, dispatch) => {
    // response.status: 'success' chỉ cho biết request thành công
    // response.data.status: true/false mới cho biết user có tồn tại không
    console.log("Check User Exist - Full response:", response);
    const userExists = response.data?.status === true || response.data?.status === 'true';

    if (userExists) {
        console.log("Check User Exist: Tồn tại", response.data);
        // Nếu có callback pending cho contact check, gọi onSuccess
        if (window.__pendingContactCheck) {
            // Kiểm tra username match hoặc không cần match (vì chỉ check 1 user tại 1 thời điểm)
            const pendingCheck = window.__pendingContactCheck;
            window.__pendingContactCheck = null; // Clear ngay để tránh gọi lại
            pendingCheck.onSuccess();
        }
    } else {
        console.log("Check User Exist: Không tồn tại", response.data?.status, response.mes);
        // Nếu có callback pending cho contact check, gọi onError
        if (window.__pendingContactCheck) {
            const pendingCheck = window.__pendingContactCheck;
            window.__pendingContactCheck = null; // Clear ngay để tránh gọi lại
            pendingCheck.onError();
        } else {
            dispatch(setError("Người dùng không tồn tại hoặc lỗi kiểm tra."));
        }
    }
};

const getProfileUsername = (profile) => (
    profile?.username ||
    profile?.user ||
    profile?.name ||
    ''
);

const getCurrentUsername = () => (
    sessionStorage.getItem("user_name") ||
    sessionStorage.getItem("current_user") ||
    localStorage.getItem("user_name") ||
    localStorage.getItem("current_user") ||
    ''
);

const notifyPendingProfileCallback = (profile) => {
    const username = getProfileUsername(profile);
    const callbacks = window.__pendingProfileCallbacks || {};
    const callback = callbacks[username];

    if (callback?.onSuccess) {
        callback.onSuccess(profile);
        delete callbacks[username];
    }
};

export const handleGetProfile = (response, dispatch) => {
    if (response.status === 'success' && response.data) {
        dispatch(updateProfileInPeople(response.data));
        notifyPendingProfileCallback(response.data);
    } else {
        const callbacks = window.__pendingProfileCallbacks || {};
        Object.values(callbacks).forEach(callback => callback?.onError?.(response.mes || 'Không thể tải hồ sơ.'));
        window.__pendingProfileCallbacks = {};
    }
};

export const handleUpdateProfile = (response, dispatch) => {
    if (response.status === 'success' && response.data) {
        const profile = response.data;
        const username = getProfileUsername(profile);
        const currentUsername = getCurrentUsername();

        dispatch(updateProfileInPeople(profile));

        if (username && username === currentUsername) {
            dispatch(setUser({
                ...profile,
                user: username,
                username,
                name: username,
            }));
        }

        window.__pendingProfileUpdate?.onSuccess?.(profile);
        window.__pendingProfileUpdate = null;
    } else {
        window.__pendingProfileUpdate?.onError?.(response.mes || 'Cập nhật hồ sơ thất bại.');
        window.__pendingProfileUpdate = null;
    }
};

export const handleProfileUpdated = (response, dispatch) => {
    if (response.status === 'success' && response.data) {
        dispatch(updateProfileInPeople(response.data));
        notifyPendingProfileCallback(response.data);
    }
};
