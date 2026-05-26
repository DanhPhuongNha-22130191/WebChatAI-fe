import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const AddMember = ({ onClick }) => (
    <button
        onClick={onClick}
        style={{
            width: '100%',
            backgroundColor: 'transparent',
            color: colors.primaryText,
            border: '1px dashed #bbb',
            borderRadius: 12,
            padding: '10px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            e.currentTarget.style.borderColor = colors.primaryButton;
            e.currentTarget.style.color = colors.primaryButton;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = '#bbb';
            e.currentTarget.style.color = colors.primaryText;
        }}
    >
        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Thêm thành viên
    </button>
);

export default AddMember;
