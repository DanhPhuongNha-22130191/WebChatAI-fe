import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setRegisterSuccess } from '../../../state/auth/authSlice.js';
import { useAuthForm } from './../hooks/useAuthForm.js';
import colors from '../../../shared/constants/colors.js';
import RegisterHeader from './components/RegisterHeader.jsx';
import RegisterFields from './components/RegisterFields.jsx';
import RegisterActions from './components/RegisterActions.jsx';
import RegisterFooter from './components/RegisterFooter.jsx';

const RegisterForm = ({ onRegisterSuccess }) => {
    const {
        username, password, confirmPass, localError, error, isReady,
        handleTyping, handleSubmit
    } = useAuthForm('REGISTER');

    const registerSuccess = useSelector(state => state.auth.registerSuccess);
    const dispatch = useDispatch();

    useEffect(() => {
        if (registerSuccess) {
            onRegisterSuccess();
            dispatch(setRegisterSuccess(false)); // Reset state
        }
    }, [registerSuccess, onRegisterSuccess, dispatch]);

    return (
        <div style={{ width: 350 }}>
            <RegisterHeader />

            {/* Hiển thị lỗi */}
            {(error || localError) && (
                <div style={{
                    color: colors.errorText,
                    backgroundColor: '#ffe6e6',
                    padding: '8px 12px',
                    borderRadius: 6,
                    marginBottom: 15,
                    fontSize: 14,
                    textAlign: 'center'
                }}>
                    {error || localError}
                </div>
            )}

            <RegisterFields
                username={username}
                password={password}
                confirmPass={confirmPass}
                onTyping={handleTyping}
            />

            <RegisterActions
                isReady={isReady}
                onRegister={handleSubmit}
            />

            <RegisterFooter onNavigateLogin={onRegisterSuccess} />
        </div>
    );
};

export default RegisterForm;
