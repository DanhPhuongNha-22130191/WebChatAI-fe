import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from "../../../app/providers/useSocket.js";
import { authService } from '../services/authService';
import { setError, clearError } from "../../../state/auth/authSlice";

// Custom Hook quản lý logic Form cho cả Login và Register
export const useAuthForm = (mode = 'LOGIN') => {
    const { actions, isReady } = useSocket();
    const dispatch = useDispatch();

    // Lấy state từ Redux Store
    const error = useSelector(state => state.auth.error);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [localError, setLocalError] = useState("");

    const handleTyping = (field, value) => {
        if (field === 'username') {
            setUsername(value);
        }
        if (field === 'password') setPassword(value);
        if (field === 'confirmPass') setConfirmPass(value);

        // Reset lỗi khi người dùng gõ
        if (localError) setLocalError("");
        if (error) dispatch(clearError());
    };

    const handleSubmit = () => {
        if (!isReady) {
            setLocalError("Mất kết nối server! Vui lòng tải lại trang.");
            return;
        }

        if (mode === 'REGISTER') {
            // Validate cho Register
            if (password !== confirmPass) {
                setLocalError("Mật khẩu nhập lại không khớp!");
                return;
            }
            // Regex: Tối thiểu 6 ký tự, có chữ hoa và số
            const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

            if (!strongPasswordRegex.test(password)) {
                setLocalError("Mật khẩu yếu: Cần tối thiểu 6 ký tự, 1 chữ hoa và 1 số!");
                return;
            }

            setLocalError("");
            authService.register(actions, username, password);

        } else {
            // Logic cho Login
            localStorage.setItem('user_name', username);
            authService.login(actions, username, password);
        }
    };

    return {
        // State
        username,
        password,
        confirmPass,
        localError,
        error, // global socket error
        isReady,

        // Actions
        handleTyping,
        handleSubmit
    };
};

