import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null, // Thông tin user đăng nhập
    error: "",  // Lỗi toàn cục
    registerSuccess: false, // Trạng thái đăng ký
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
        },
        clearUser(state) {
            state.user = null;
        },
        setError(state, action) {
            state.error = action.payload ?? "";
        },
        clearError(state) {
            state.error = "";
        },
        setRegisterSuccess(state, action) {
            state.registerSuccess = !!action.payload;
        },
    },
});

export const { setUser, clearUser, setError, clearError, setRegisterSuccess } = authSlice.actions;
export default authSlice.reducer;
