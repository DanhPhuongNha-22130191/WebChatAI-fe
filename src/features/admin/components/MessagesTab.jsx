import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useApi } from '../../../app/providers/useApi.js';
import { createAdminService } from '../services/adminService.js';
import {
  setMessages, setMessagesLoading, setMessagesPage, setMessagesFilter,
  removeMessageFromList, updateMessageInList, setError,
} from '../../../state/admin/adminSlice.js';
import ConfirmModal from './ConfirmModal.jsx';
import styles from './MessagesTab.module.css';

const MSG_TYPE_OPTIONS = ['', 'TEXT', 'IMAGE', 'VIDEO', 'FILE', 'AUDIO'];
const STATUS_COLOR = {
  SENT: '#10b981', RECALLED: '#ef4444', EDITED: '#f59e0b', DELETED: '#94a3b8',
};

export default function MessagesTab() {
  const dispatch = useDispatch();
  const { actions } = useApi();
  const {
    messages, messagesPage, messagesTotalPages, messagesTotalElements,
    messagesLoading, messagesFilter,
  } = useSelector((s) => s.admin);

  const [filterInput, setFilterInput] = useState({ type: '', sender: '', receiver: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [recallTarget, setRecallTarget] = useState(null);

  const adminSvc = createAdminService(actions);

  const load = async (page = messagesPage, filter = messagesFilter) => {
    dispatch(setMessagesLoading(true));
    try {
      const res = await adminSvc.searchMessages({ ...filter, page, size: 20 });
      dispatch(setMessages(res?.data || res));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setMessagesLoading(false));
    }
  };

  useEffect(() => { load(0, {}); setFilterInput({ type: '', sender: '', receiver: '' }); }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    dispatch(setMessagesFilter(filterInput));
    dispatch(setMessagesPage(0));
    load(0, filterInput);
  };

  const handleResetFilter = () => {
    const empty = { type: '', sender: '', receiver: '' };
    setFilterInput(empty);
    dispatch(setMessagesFilter(empty));
    dispatch(setMessagesPage(0));
    load(0, empty);
  };

  const handlePage = (p) => {
    dispatch(setMessagesPage(p));
    load(p, messagesFilter);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminSvc.deleteMessage(deleteTarget.id);
      dispatch(removeMessageFromList(deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  const handleRecall = async () => {
    if (!recallTarget) return;
    try {
      const res = await adminSvc.recallMessage(recallTarget.id);
      dispatch(updateMessageInList(res?.data || res));
      setRecallTarget(null);
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  const truncate = (str, len = 60) =>
    !str ? '—' : str.length > len ? str.slice(0, len) + '…' : str;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Tin nhắn</h2>
          <p className={styles.subtitle}>{messagesTotalElements} tin nhắn</p>
        </div>
      </div>

      {/* Filter bar */}
      <form className={styles.filterBar} onSubmit={handleApplyFilter} id="messages-filter-form">
        <select
          className={styles.select}
          value={filterInput.type}
          onChange={(e) => setFilterInput({ ...filterInput, type: e.target.value })}
          id="msg-filter-type"
        >
          {MSG_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t || 'Tất cả loại'}</option>
          ))}
        </select>
        <input
          className={styles.filterInput}
          placeholder="Người gửi..."
          value={filterInput.sender}
          onChange={(e) => setFilterInput({ ...filterInput, sender: e.target.value })}
          id="msg-filter-sender"
        />
        <input
          className={styles.filterInput}
          placeholder="Người nhận / phòng..."
          value={filterInput.receiver}
          onChange={(e) => setFilterInput({ ...filterInput, receiver: e.target.value })}
          id="msg-filter-receiver"
        />
        <button type="submit" className={styles.applyBtn} id="msg-filter-apply">Lọc</button>
        <button type="button" className={styles.resetBtn} onClick={handleResetFilter} id="msg-filter-reset">Đặt lại</button>
      </form>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Loại</th>
              <th>Người gửi</th>
              <th>Người nhận</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Ngày gửi</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {messagesLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className={styles.skeletonRow}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j}><span className={styles.skeleton} /></td>
                    ))}
                  </tr>
                ))
              : messages.map((m) => {
                  const statusKey = m.recalled ? 'RECALLED' : m.edited ? 'EDITED' : 'SENT';
                  return (
                    <tr key={m.id} className={styles.row}>
                      <td className={styles.idCell}>{m.id?.slice(0, 8)}…</td>
                      <td>
                        <span className={styles.typeBadge}>{m.type}</span>
                      </td>
                      <td className={styles.userCell}>@{m.sender}</td>
                      <td className={styles.userCell}>@{m.receiver}</td>
                      <td className={styles.contentCell} title={m.content}>
                        {truncate(m.content)}
                      </td>
                      <td>
                        <div className={styles.statusCell}>
                          <span
                            className={styles.statusDot}
                            style={{ background: STATUS_COLOR[statusKey] || '#94a3b8' }}
                          />
                          {statusKey}
                        </div>
                      </td>
                      <td className={styles.dateCell}>
                        {m.createdAt ? new Date(m.createdAt).toLocaleString('vi-VN') : '—'}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {!m.recalled && (
                            <button
                              className={styles.recallBtn}
                              onClick={() => setRecallTarget(m)}
                              title="Thu hồi"
                              id={`recall-msg-${m.id}`}
                            >↩️</button>
                          )}
                          <button
                            className={styles.deleteBtn}
                            onClick={() => setDeleteTarget(m)}
                            title="Xoá"
                            id={`delete-msg-${m.id}`}
                          >🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {messagesTotalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={messagesPage === 0} onClick={() => handlePage(messagesPage - 1)}>← Trước</button>
          {Array.from({ length: Math.min(messagesTotalPages, 7) }, (_, i) => (
            <button key={i} className={`${styles.pageBtn} ${i === messagesPage ? styles.pageActive : ''}`} onClick={() => handlePage(i)}>{i + 1}</button>
          ))}
          {messagesTotalPages > 7 && <span className={styles.ellipsis}>…</span>}
          <button className={styles.pageBtn} disabled={messagesPage >= messagesTotalPages - 1} onClick={() => handlePage(messagesPage + 1)}>Sau →</button>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xoá tin nhắn?"
        message="Xoá vĩnh viễn tin nhắn này khỏi hệ thống. Không thể hoàn tác!"
        confirmLabel="Xoá"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmModal
        isOpen={!!recallTarget}
        title="Thu hồi tin nhắn?"
        message="Thu hồi tin nhắn này — nội dung sẽ bị ẩn với người nhận."
        confirmLabel="Thu hồi"
        confirmVariant="warning"
        onConfirm={handleRecall}
        onCancel={() => setRecallTarget(null)}
      />
    </div>
  );
}
