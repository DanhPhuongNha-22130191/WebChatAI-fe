import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setError } from '../../../state/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import Card from '../../../shared/components/Card.jsx';
import LoginForm from '../login/LoginForm.jsx';
import styles from './AuthLayout.module.css';
import Iridescence from '../../../shared/components/Iridescence.jsx';
const LoginPage = () => {
    // 1. Lấy user từ Redux
    const user = useSelector(state => state.auth.user);

    // Hook điều hướng trang
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // 1b. Reset lỗi khi mới vào trang
    useEffect(() => {
        dispatch(setError(""));
    }, [dispatch]);

    // 2. Logic Tự động chuyển hướng nếu đã login
    useEffect(() => {
        if (user) {
            console.log("Đăng nhập thành công, đang chuyển trang...");
            navigate("/chat"); // Chuyển sang trang Chat
        }
    }, [user, navigate]);

    return (
        <div className={styles.page} style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <Iridescence
                    color={[1, 1, 1]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={0.1}
                />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <Card
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.55)',
                        cursor: 'default',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '2px solid rgba(251, 101, 31, 0.85)',
                        boxShadow: '0 8px 24px rgba(228, 27, 27, 0.37)',
                        padding: 40
                    }}
                >
                    <LoginForm />
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
