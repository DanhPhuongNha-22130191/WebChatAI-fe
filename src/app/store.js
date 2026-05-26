import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../state/auth/authSlice";
import chatReducer from "../state/chat/chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
});