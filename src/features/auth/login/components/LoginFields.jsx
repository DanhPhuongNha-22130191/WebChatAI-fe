import React from 'react';
import TextInput from '../../../../shared/components/TextInput.jsx';
import colors from '../../../../shared/constants/colors.js';

const LoginFields = ({ username, password, onTyping }) => {
    return (
        <>
            <TextInput
                label="Tên người dùng"
                placeholder="Nhập tên của bạn"
                value={username}
                onChange={(e) => onTyping('username', e.target.value)}
                style={{ borderColor: colors.cardBorder, color: colors.primaryText, fontWeight: 500 }}
            />

            <TextInput
                label="Mật khẩu"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => onTyping('password', e.target.value)}
                style={{ borderColor: colors.cardBorder }}
            />
        </>
    );
};

export default LoginFields;
