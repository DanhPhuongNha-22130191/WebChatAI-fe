import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const HeaderInfo = () => (
    <div style={{
        padding: 16,
        backgroundColor: 'var(--theme-header-bg, #FF5596)',
        color: 'var(--theme-text-on-primary, #FFFFFF)',
        fontWeight: 'bold',
        fontSize: 18,
        height: 71,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center'
    }}>
        Chi tiết
    </div>
);

export default HeaderInfo;
