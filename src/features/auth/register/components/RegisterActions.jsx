import React from 'react';
import Button from '../../../../shared/components/Button.jsx';
import colors from '../../../../shared/constants/colors.js';

const RegisterActions = ({ isReady, onRegister }) => {
    return (
        <Button
            disabled={!isReady}
            onClick={onRegister}
            style={{
                backgroundColor: colors.primaryButton,
                marginTop: 10
            }}
        >
            {isReady ? "Đăng ký" : "Đang kết nối..."}
        </Button>
    );
};

export default RegisterActions;
