import React from 'react';
import colors from '../../../../shared/constants/colors';

const MemberSummary = ({ membersOrCount = 0, onClick }) => {
    const count = typeof membersOrCount === 'number' ? membersOrCount : membersOrCount.length;

    return (
        <div
            onClick={onClick}
            style={{
                padding: '12px 16px',
                margin: '16px 16px 0 16px',
                borderRadius: 12,
                border: '1px solid #E0E0E0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFE5F0'; // Hover effect like Card
                e.currentTarget.style.borderColor = '#FFDAEB';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E0E0E0';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Icon Users */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primaryText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span style={{ fontWeight: 600, fontSize: 15, color: colors.primaryText }}>Thành viên</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>{count}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>
        </div>
    );
};

export default MemberSummary;
