import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage.jsx";
import RegisterPage from "../features/auth/pages/RegisterPage.jsx";
import ChatPage from "../features/chat/pages/ChatPage.jsx";
import colors from "../shared/constants/colors.js";
import GlobalLoading from "../shared/components/GlobalLoading.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <GlobalLoading />

            <div
                id="app-root"
                style={{
                    minHeight: "100vh",
                    "--gradient-start": colors.gradientStart,
                    "--gradient-end": colors.gradientEnd,

                    "--card-bg": colors.cardBackground,
                    "--card-border": colors.cardBorder,
                    "--card-shadow": colors.cardShadow,

                    "--text-primary": colors.primaryText,
                    "--text-normal": colors.normalText,
                    "--text-error": colors.errorText,

                    "--btn-primary": colors.primaryButton,
                    "--btn-disabled": colors.disabledButton,

                    "--chat-header-bg": colors.chatHeaderBackground,
                    "--chat-sender-bg": colors.chatSenderBackground,
                    "--chat-receiver-bg": colors.chatReceiverBackground,
                }}
            >
                <Routes>
                    {/* Default route */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* Pages */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/chat" element={<ChatPage />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
