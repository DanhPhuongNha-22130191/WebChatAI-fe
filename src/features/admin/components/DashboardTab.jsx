import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useApi } from '../../../app/providers/useApi.js';
import { createAdminService } from '../services/adminService.js';
import {
  setStats, setStatsLoading, setError,
} from '../../../state/admin/adminSlice.js';
import styles from './DashboardTab.module.css';

const StatCard = ({ icon, label, value, sub, color, loading }) => (
  <div className={styles.card} style={{ '--accent': color }}>
    <div className={styles.cardIcon}>{icon}</div>
    <div className={styles.cardBody}>
      <div className={styles.cardValue}>
        {loading ? <span className={styles.skeleton} /> : (value ?? '—')}
      </div>
      <div className={styles.cardLabel}>{label}</div>
      {sub && <div className={styles.cardSub}>{sub}</div>}
    </div>
  </div>
);

export default function DashboardTab() {
  const dispatch = useDispatch();
  const { actions } = useApi();
  const stats = useSelector((s) => s.admin.stats);
  const loading = useSelector((s) => s.admin.statsLoading);

  const load = async () => {
    dispatch(setStatsLoading(true));
    try {
      const adminSvc = createAdminService(actions);
      const res = await adminSvc.getStats();
      dispatch(setStats(res?.data || res));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setStatsLoading(false));
    }
  };

  useEffect(() => { load(); }, []);

  const cards = [
    {
      label: 'Tổng người dùng',
      value: stats?.totalUsers?.toLocaleString(),
      sub: `+${stats?.newUsersToday ?? 0} hôm nay`,
      color: '#6366f1',
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="7" r="4" fill="currentColor" />
          <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      ),
    },
    {
      label: 'Đang trực tuyến',
      value: stats?.onlineUsers?.toLocaleString(),
      sub: 'Người dùng online',
      color: '#10b981',
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none" opacity=".4" />
          <circle cx="12" cy="12" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" opacity=".15" />
        </svg>
      ),
    },
    {
      label: 'Tổng phòng chat',
      value: stats?.totalRooms?.toLocaleString(),
      sub: 'Tất cả loại phòng',
      color: '#f59e0b',
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: 'Tổng tin nhắn',
      value: stats?.totalMessages?.toLocaleString(),
      sub: `+${stats?.newMessagesToday ?? 0} hôm nay`,
      color: '#ec4899',
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9a9 9 0 01-4.47-1.19L3 21l1.19-4.53A9 9 0 1121 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      ),
    },
    {
      label: 'Chờ phê duyệt',
      value: stats?.pendingConversations?.toLocaleString(),
      sub: 'Pending conversations',
      color: '#8b5cf6',
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Dashboard</h2>
          <p className={styles.subtitle}>Tổng quan hệ thống WebChatAI</p>
        </div>
        <button className={styles.refreshBtn} onClick={load} id="dashboard-refresh">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path d="M4 4v5h5M20 20v-5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4.06 9A8 8 0 0119.9 15M19.94 15A8 8 0 014.1 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Làm mới
        </button>
      </div>

      <div className={styles.grid}>
        {cards.map((c, i) => (
          <StatCard key={i} {...c} loading={loading} />
        ))}
      </div>

      {/* Activity summary */}
      <div className={styles.activityCard}>
        <h3 className={styles.activityTitle}>Hoạt động hôm nay</h3>
        <div className={styles.activityRow}>
          <div className={styles.activityItem}>
            <div className={styles.activityDot} style={{ background: '#6366f1' }} />
            <span>Người dùng mới</span>
            <strong>{stats?.newUsersToday ?? '—'}</strong>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityDot} style={{ background: '#ec4899' }} />
            <span>Tin nhắn mới</span>
            <strong>{stats?.newMessagesToday ?? '—'}</strong>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityDot} style={{ background: '#10b981' }} />
            <span>Đang online</span>
            <strong>{stats?.onlineUsers ?? '—'}</strong>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityDot} style={{ background: '#8b5cf6' }} />
            <span>Chờ duyệt</span>
            <strong>{stats?.pendingConversations ?? '—'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
