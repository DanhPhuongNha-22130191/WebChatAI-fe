import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const ContactRequestHeader = ({ onClose }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #FFB3D9',
        width: '100%',
        boxSizing: 'border-box',
        flexShrink: 0
    }}>
        <h2 style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: colors.primaryText
        }}>
            Gửi yêu cầu
        </h2>
        {onClose && (
            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.primaryText
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        )}
    </div>
);

export default ContactRequestHeader;

