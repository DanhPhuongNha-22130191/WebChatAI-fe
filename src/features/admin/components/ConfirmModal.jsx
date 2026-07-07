import React from 'react';
import styles from './ConfirmModal.module.css';

/**
 * Modal xác nhận hành động nguy hiểm (xoá, thu hồi...)
 * Props:
 *   isOpen, title, message, confirmLabel, confirmVariant ('danger'|'warning'), onConfirm, onCancel
 */
export default function ConfirmModal({
  isOpen,
  title = 'Xác nhận',
  message,
  confirmLabel = 'Xác nhận',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          {confirmVariant === 'danger' ? (
            <svg viewBox="0 0 24 24" fill="none" className={styles.icon}>
              <circle cx="12" cy="12" r="10" fill="#fee2e2" />
              <path d="M12 8v4m0 4h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className={styles.icon}>
              <circle cx="12" cy="12" r="10" fill="#fef3c7" />
              <path d="M12 8v4m0 4h.01" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Huỷ</button>
          <button
            className={confirmVariant === 'danger' ? styles.dangerBtn : styles.warningBtn}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
