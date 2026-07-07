import React, { useState, useEffect } from 'react';
import styles from './EditUserModal.module.css';

/**
 * Modal chỉnh sửa thông tin user
 * Props: isOpen, user, onSave(updatedFields), onClose
 */
export default function EditUserModal({ isOpen, user, onSave, onClose }) {
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('USER');
  const [status, setStatus] = useState('OFFLINE');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.username || '');
      setRole(user.role || 'USER');
      setStatus(user.status || 'OFFLINE');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ displayName, role, status });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.avatar}>
            {user.avatar
              ? <img src={user.avatar} alt={user.username} className={styles.avatarImg} />
              : <span>{(user.displayName || user.username || '?')[0].toUpperCase()}</span>
            }
          </div>
          <div>
            <h3 className={styles.username}>{user.username}</h3>
            <span className={styles.userId}>ID: {user.id}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Fields */}
        <div className={styles.body}>
          <label className={styles.label}>
            Tên hiển thị
            <input
              className={styles.input}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name..."
            />
          </label>

          <label className={styles.label}>
            Vai trò (Role)
            <select
              className={styles.select}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>

          <label className={styles.label}>
            Trạng thái
            <select
              className={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ONLINE">ONLINE</option>
              <option value="OFFLINE">OFFLINE</option>
              <option value="AWAY">AWAY</option>
              <option value="BANNED">BANNED</option>
            </select>
          </label>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>Huỷ</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}
