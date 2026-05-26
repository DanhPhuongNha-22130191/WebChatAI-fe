import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setError, setRegisterSuccess } from '../../../state/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import Card from '../../../shared/components/Card.jsx';
import RegisterForm from '../register/RegisterForm.jsx';
import styles from './AuthLayout.module.css';
import Iridescence from '../../../shared/components/Iridescence.jsx';

const RegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 1. Reset lỗi & trạng thái cũ khi mới vào trang
    useEffect(() => {
        dispatch(setError(""));
        dispatch(setRegisterSuccess(false));
    }, [dispatch]);

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
                    <RegisterForm onRegisterSuccess={() => navigate('/login')} />
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;
