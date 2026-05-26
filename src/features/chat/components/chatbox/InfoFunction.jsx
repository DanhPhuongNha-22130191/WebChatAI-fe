import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const ButtonCard = ({ onClick, children, isDestructive = false }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E0E0E0',
            borderRadius: 12,
            cursor: 'pointer',
            fontSize: 15,
            color: isDestructive ? colors.errorText : colors.normalText,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s',
            fontWeight: 500
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FFE5F0';
            e.currentTarget.style.borderColor = '#FFDAEB';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.borderColor = '#E0E0E0';
        }}
    >
        {children}
    </button>
);

const InfoFunction = ({ isGroup = false, onRename, onChangeTheme, onLeaveRoom }) => (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Đổi tên phòng chat */}
        <ButtonCard onClick={onRename}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Đổi tên phòng chat
        </ButtonCard>

        {/* Đổi chủ đề */}
        <ButtonCard onClick={onChangeTheme}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a7 7 0 1 0 10 10" />
            </svg>
            Đổi chủ đề
        </ButtonCard>

        {/* Rời khỏi phòng chat */}
        {isGroup && (
            <ButtonCard onClick={onLeaveRoom} isDestructive={true}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Rời khỏi phòng chat
            </ButtonCard>
        )}
    </div>
);

export default InfoFunction;
