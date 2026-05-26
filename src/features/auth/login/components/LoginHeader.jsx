import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const LoginHeader = () => {
    return (
        <h2 style={{
            textAlign: 'center',
            color: colors.primaryText,
            marginBottom: 20,
            marginTop: 0
        }}>
            LangChat - SubeoApp
        </h2>
    );
};

export default LoginHeader;
