import React from 'react';
import { THEME_COMBOS } from '../../constants/themeConstants';
import colors from '../../../../shared/constants/colors';

const ThemeSelectorModal = ({ onClose, onSelect }) => {
    return (
        <div style={{
            padding: 20,
            backgroundColor: '#fff',
            borderRadius: 12,
            width: 300,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
            <div style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 16,
                color: colors.primaryText,
                textAlign: 'center'
            }}>
                Chọn chủ đề cuộc trò truyện
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16
            }}>
                {Object.entries(THEME_COMBOS).map(([id, combo]) => (
                    <div
                        key={id}
                        onClick={() => {
                            onSelect(id);
                            onClose();
                        }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            background: combo.gradient,
                            border: '3px solid #fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                        <div style={{
                            fontSize: 12,
                            textAlign: 'center',
                            color: colors.normalText,
                            fontWeight: 500
                        }}>
                            {combo.name}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={onClose}
                style={{
                    marginTop: 20,
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#f0f0f0',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600
                }}
            >
                Đóng
            </button>
        </div>
    );
};

export default ThemeSelectorModal;
