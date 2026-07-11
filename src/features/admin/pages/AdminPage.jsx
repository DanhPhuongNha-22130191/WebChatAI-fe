import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import DashboardTab from '../components/DashboardTab.jsx';
import UsersTab from '../components/UsersTab.jsx';
import RoomsTab from '../components/RoomsTab.jsx';
import MessagesTab from '../components/MessagesTab.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Iridescence from '../../../shared/components/Iridescence.jsx';
import { useSocket } from '../../../app/providers/useSocket.js';
import styles from './AdminPage.module.css';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const adminError = useSelector((s) => s.admin.error);
  const { actions: socketActions } = useSocket();

  const iridescenceColor = useMemo(() => [1, 1, 1], []);

  // Guard: chỉ ADMIN mới được vào
  // Kiểm tra role (sau khi backend restart) HOẶC username = 'admin' (fallback)
  const isAdmin = user && (
    user.role === 'ADMIN' ||
    user.role === 'ROLE_ADMIN' ||
    user.username === 'admin' ||
    user.user === 'admin' ||
    user.name === 'admin'
  );

  const hasCode = localStorage.getItem("re_login_code") || sessionStorage.getItem("re_login_code");

  if (!user && hasCode) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '8px' }}>Đang khôi phục phiên làm việc...</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }


  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'users': return <UsersTab />;
      case 'rooms': return <RoomsTab />;
      case 'messages': return <MessagesTab />;
      default: return <DashboardTab />;
    }
  };

  const handleConfirmLogout = () => {
    socketActions.logout();
    setShowLogoutConfirm(false);

    // Fallback: nếu socket chưa kịp trả LOGOUT thì vẫn xóa phiên local để tránh kẹt màn hình.
    setTimeout(() => {
      const stillHasToken =
        localStorage.getItem("jwt_token") ||
        localStorage.getItem("re_login_code");
      if (stillHasToken) {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("re_login_code");
        localStorage.removeItem("user_name");
        navigate("/login", { replace: true });
      }
    }, 700);
  };

  return (
    <div className={styles.layout}>
      {/* Lớp nền hiệu ứng Iridescence */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Iridescence
          color={iridescenceColor}
          speed={0.1}
          amplitude={0.1}
          mouseReact={false}
        />
      </div>

      <div className={styles.layoutContent}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={() => setShowLogoutConfirm(true)}
        />

        <main className={styles.main}>
          {/* Top bar */}
          <div className={styles.topbar}>
            <div className={styles.topbarLeft}>
              <div className={styles.breadcrumb}>
                <span>Admin</span>
                <span className={styles.sep}>›</span>
                <span className={styles.breadcrumbActive}>
                  {{ dashboard: 'Dashboard', users: 'Người dùng', rooms: 'Phòng chat', messages: 'Tin nhắn' }[activeTab]}
                </span>
              </div>
            </div>
            <div className={styles.topbarRight}>
              {adminError && (
                <div className={styles.errorBanner}>⚠️ {adminError}</div>
              )}
              <div className={styles.userPill}>
                <div className={styles.userPillAvatar}>
                  {(user.displayName || user.username || user.user || '?')[0].toUpperCase()}
                </div>
                <div className={styles.userPillInfo}>
                  <span className={styles.userPillName}>{user.displayName || user.username || user.user}</span>
                  <span className={styles.userPillRole}>Administrator</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className={styles.content}>
            {renderTab()}
          </div>
        </main>
      </div>

      {/* Confirmation modal for logout */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Đăng xuất?"
        message="Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?"
        confirmLabel="Đăng xuất"
        confirmVariant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}

