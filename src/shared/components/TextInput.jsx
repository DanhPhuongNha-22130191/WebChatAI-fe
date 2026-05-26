import React from 'react';
import colors from "../constants/colors.js";

const TextInput = ({ label, type = 'text', value, onChange, placeholder, style = {}, ...props }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div style={{ marginBottom: 15, textAlign: 'left' }}>
            {label && <label style={{ display: 'block', marginBottom: 5, fontWeight: 500, color: '#000000' }}>{label}</label>}
            <div style={{ position: 'relative' }}>
                <input
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        backgroundColor: '#FFFFFF',
                        padding: 10,
                        paddingRight: isPassword ? 40 : 10,
                        color: '#000000',
                        borderRadius: 6,
                        border: '1px solid #ddd',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                        ...style
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.cardBorder}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#ddd';
                        if (props.onBlur) props.onBlur(e);
                    }}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#000000', // Yêu cầu màu đen
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {showPassword ? (
                            // Icon Mở mắt
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        ) : (
                            // Icon Đóng mắt
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TextInput;
