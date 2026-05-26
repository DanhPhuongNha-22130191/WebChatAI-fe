import React from 'react';
import styles from './PageHeader.module.css';

const PageHeader = ({ onLogout }) => {
    return (
        <div className={styles.header}>
            <div className={styles.logo}>
                LangChat - SubeoApp
            </div>
            <button className={styles.logoutBtn} onClick={onLogout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H15M11 16L15 12M15 12L11 8M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Đăng xuất</span>
            </button>
        </div>
    );
};

export default PageHeader;
