import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../state/auth/authSlice";
import chatReducer from "../state/chat/chatSlice";
import adminReducer from "../state/admin/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    admin: adminReducer,
  },
});