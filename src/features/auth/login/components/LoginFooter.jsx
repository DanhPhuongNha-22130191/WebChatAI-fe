import React from 'react';
import colors from '../../../../shared/constants/colors.js';
import { Link } from 'react-router-dom';

const LoginFooter = () => {
    return (
        <div style={{
            textAlign: 'center',
            fontSize: 13,
            marginTop: 15,
            color: colors.primaryText
        }}>
            Bạn chưa có tài khoản? <Link to="/register" style={{ fontWeight: 'bold', textDecoration: 'none', color: colors.primaryText }}>Tạo tài khoản tại đây</Link>
        </div>
    );
};

export default LoginFooter;
