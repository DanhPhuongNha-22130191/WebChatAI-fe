import React from 'react';
import styles from './LogoutModal.module.css';
import Button from '../../../../shared/components/Button.jsx';

const LogoutModal = ({ onClose, onConfirm }) => {
    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.container} onClick={(e) => e.stopPropagation()}>
                <div className={styles.iconWrapper}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </div>

                <h3 className={styles.title}>Đăng xuất?</h3>
                <p className={styles.message}>Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?</p>

                <div className={styles.actions}>
                    <Button
                        onClick={onClose}
                        style={{
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            flex: 1
                        }}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={onConfirm}
                        style={{
                            backgroundColor: '#ef4444',
                            color: '#fff',
                            flex: 1
                        }}
                    >
                        Đăng xuất
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
