import React from 'react';
import { useSocket } from '../../app/providers/useSocket';
import Loading from './Loading';
import Button from './Button';
import styles from './GlobalLoading.module.css';

const GlobalLoading = () => {
    const { isReady, connectionError, reconnect } = useSocket();

    if (isReady) return null;

    return (
        <div className={styles.overlay}>
            {connectionError ? (
                // Giao diện hiển thị lỗi
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}></div>
                    <h3 className={styles.errorTitle}>Kết nối thất bại</h3>
                    <p className={styles.errorMessage}>
                        {connectionError}
                    </p>
                    <Button onClick={reconnect}>
                        Thử lại
                    </Button>
                </div>
            ) : (
                // Giao diện Loading
                <Loading text="Đang kết nối..." />
            )}
        </div>
    );
};

export default GlobalLoading;
