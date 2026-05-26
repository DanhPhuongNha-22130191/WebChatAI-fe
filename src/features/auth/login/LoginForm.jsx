import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuthForm } from '../hooks/useAuthForm';
import colors from '../../../shared/constants/colors.js';
import LoginHeader from './components/LoginHeader.jsx';
import LoginFields from './components/LoginFields.jsx';
import LoginActions from './components/LoginActions.jsx';
import LoginFooter from './components/LoginFooter.jsx';

const LoginForm = () => {
    const {
        username, password, error, isReady,
        handleTyping, handleSubmit
    } = useAuthForm('LOGIN');

    const user = useSelector(state => state.auth.user);
    const navigate = useNavigate();

    // Tự động chuyển trang khi login thành công
    useEffect(() => {
        if (user) {
            navigate("/chat");
        }
    }, [user, navigate]);

    return (
        <div style={{ width: 350 }}>
            <LoginHeader />

            {/* Thông báo lỗi nếu có */}
            {error && (
                <div style={{
                    color: colors.errorText,
                    backgroundColor: '#ffe6e6',
                    padding: '8px 12px',
                    borderRadius: 6,
                    marginBottom: 15,
                    fontSize: 14,
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            )}

            <LoginFields
                username={username}
                password={password}
                onTyping={handleTyping}
            />

            <LoginActions
                isReady={isReady}
                onLogin={handleSubmit}
            />

            <LoginFooter />
        </div>
    );
};

export default LoginForm;
