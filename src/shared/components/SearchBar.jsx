import React from 'react';
import colors from "../constants/colors.js";

const SearchBar = ({ placeholder = "Tìm kiếm...", value, onChange, style = {} }) => {
    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                color: '#666'
            }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            </div>

            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    color: 'black',
                    padding: '10px 10px 10px 38px', // Padding trái lớn hơn cho icon
                    borderRadius: 12,
                    border: `1px solid ${colors.cardBorder}`,
                    outline: 'none',
                    boxSizing: 'border-box',
                    ...style
                }}
            />
        </div>
    );
};

export default SearchBar;
