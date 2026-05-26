import React, { useState, useEffect } from 'react';
import Button from '../../../../shared/components/Button';
import colors from '../../../../shared/constants/colors';

const SearchResult = ({ searchQuery, onContact, contactError }) => {
    const [showError, setShowError] = useState(false);

    // Hiển thị lỗi khi có contactError và tự ẩn sau 3 giây
    useEffect(() => {
        if (contactError) {
            setShowError(true);
            const timer = setTimeout(() => {
                setShowError(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [contactError]);

    return (
        <div style={{
            padding: '40px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            flex: 1,
            minHeight: 0
        }}>
            {showError && contactError ? (
                <div style={{
                    fontSize: 15,
                    color: colors.primaryText,
                    textAlign: 'center',
                    fontWeight: 500
                }}>
                    {contactError}
                </div>
            ) : (
                <div style={{
                    fontSize: 15,
                    color: colors.primaryText,
                    textAlign: 'center',
                    fontWeight: 500
                }}>
                    Bạn chưa liên hệ với người dùng này
                </div>
            )}
            <Button
                onClick={() => onContact(searchQuery)}
                style={{
                    width: 'auto',
                    minWidth: '120px',
                    padding: '10px 24px',
                    backgroundColor: colors.primaryButton,
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
            >
                Liên hệ
            </Button>
        </div>
    );
};

export default SearchResult;

