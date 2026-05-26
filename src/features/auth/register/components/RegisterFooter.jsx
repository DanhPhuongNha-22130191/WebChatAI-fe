import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const RegisterFooter = ({ onNavigateLogin }) => {
    return (
        <div style={{
            textAlign: 'center',
            fontSize: 13,
            marginTop: 15,
            color: colors.primaryText
        }}>
            Bạn đã có tài khoản? <span style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={onNavigateLogin}>Đăng nhập tại đây</span>
        </div>
    );
};

export default RegisterFooter;
