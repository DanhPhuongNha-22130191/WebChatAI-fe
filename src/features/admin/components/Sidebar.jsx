import React from 'react';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity=".9" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity=".9" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity=".9" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity=".9" />
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'Người dùng',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="4" fill="currentColor" />
        <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M17 8c1.1 0 2 .9 2 2s-.9 2-2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M20 20c0-2.2-1.3-4-3-4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 'rooms',
    label: 'Phòng chat',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'messages',
    label: 'Tin nhắn',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9a9 9 0 01-4.47-1.19L3 21l1.19-4.53A9 9 0 1121 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
];

export default function Sidebar({ activeTab, onTabChange, onLogout }) {
  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoWrap}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="url(#sg)" />
            <path d="M10 20V13a6 6 0 1112 0v7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--theme-primary, var(--btn-primary, #7A003C))" />
                <stop offset="1" stopColor="var(--theme-header-bg, var(--chat-header-bg, #FF5596))" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <div className={styles.logoTitle}>Web Chat <span>Application</span></div>
          <div className={styles.logoSub}>Admin Panel</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navSection}>QUẢN LÝ</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            id={`sidebar-${item.id}`}
            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
            {activeTab === item.id && <span className={styles.activeBar} />}
          </button>
        ))}
      </nav>

      {/* Bottom: logout */}
      <div className={styles.bottomWrap}>
        <button className={styles.logoutBtn} onClick={onLogout} id="admin-logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
