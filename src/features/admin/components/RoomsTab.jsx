import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useApi } from '../../../app/providers/useApi.js';
import { createAdminService } from '../services/adminService.js';
import {
  setRooms, setRoomsLoading, setRoomsPage,
  setSelectedRoom, removeRoomFromList, setError,
} from '../../../state/admin/adminSlice.js';
import ConfirmModal from './ConfirmModal.jsx';
import styles from './RoomsTab.module.css';

const TYPE_COLOR = { GROUP: '#6366f1', PRIVATE: '#10b981', PUBLIC: '#f59e0b' };

export default function RoomsTab() {
  const dispatch = useDispatch();
  const { actions } = useApi();
  const {
    rooms, roomsPage, roomsTotalPages, roomsTotalElements,
    roomsLoading, selectedRoom,
  } = useSelector((s) => s.admin);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const adminSvc = createAdminService(actions);

  const load = async (page = roomsPage) => {
    dispatch(setRoomsLoading(true));
    try {
      const res = await adminSvc.getRooms(page, 20);
      dispatch(setRooms(res?.data || res));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setRoomsLoading(false));
    }
  };

  useEffect(() => { load(0); }, []);

  const handleViewDetail = async (room) => {
    if (selectedRoom?.name === room.name) {
      dispatch(setSelectedRoom(null));
      return;
    }
    setLoadingDetail(true);
    try {
      const res = await adminSvc.getRoomDetail(room.name);
      dispatch(setSelectedRoom(res?.data || res));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminSvc.deleteRoom(deleteTarget.name);
      dispatch(removeRoomFromList(deleteTarget.name));
      if (selectedRoom?.name === deleteTarget.name) dispatch(setSelectedRoom(null));
      setDeleteTarget(null);
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Phòng chat</h2>
          <p className={styles.subtitle}>{roomsTotalElements} phòng trong hệ thống</p>
        </div>
        <button className={styles.refreshBtn} onClick={() => load(roomsPage)} id="rooms-refresh">
          <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
            <path d="M4 4v5h5M20 20v-5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4.06 9A8 8 0 0119.9 15M19.94 15A8 8 0 014.1 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Làm mới
        </button>
      </div>

      <div className={styles.content}>
        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên phòng</th>
                <th>Loại</th>
                <th>Chủ phòng</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {roomsLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className={styles.skeletonRow}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j}><span className={styles.skeleton} /></td>
                      ))}
                    </tr>
                  ))
                : rooms.map((r) => (
                    <tr
                      key={r.name || r.id}
                      className={`${styles.row} ${selectedRoom?.name === r.name ? styles.rowActive : ''}`}
                    >
                      <td>
                        <div className={styles.roomNameCell}>
                          <div className={styles.roomIcon} style={{ '--rc': TYPE_COLOR[r.type] || '#6366f1' }}>
                            {r.name?.[0]?.toUpperCase() || '#'}
                          </div>
                          <span className={styles.roomName}>{r.name}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={styles.badge}
                          style={{
                            background: `${TYPE_COLOR[r.type] || '#6366f1'}15`,
                            color: TYPE_COLOR[r.type] || '#6366f1',
                          }}
                        >
                          {r.type || 'GROUP'}
                        </span>
                      </td>
                      <td className={styles.ownerCell}>@{r.ownerUsername || '—'}</td>
                      <td className={styles.dateCell}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.viewBtn}
                            onClick={() => handleViewDetail(r)}
                            title="Xem chi tiết"
                            id={`view-room-${r.id || r.name}`}
                          >
                            👁️
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => setDeleteTarget(r)}
                            title="Xoá phòng"
                            id={`delete-room-${r.id || r.name}`}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selectedRoom && (
          <div className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <div className={styles.detailRoomIcon}>
                {selectedRoom.name?.[0]?.toUpperCase() || '#'}
              </div>
              <div>
                <h3 className={styles.detailName}>{selectedRoom.name}</h3>
                <span className={styles.detailType}>{selectedRoom.type}</span>
              </div>
              <button
                className={styles.closeDetail}
                onClick={() => dispatch(setSelectedRoom(null))}
              >✕</button>
            </div>
            <div className={styles.detailInfo}>
              <div className={styles.infoRow}>
                <span>Chủ phòng</span>
                <strong>@{selectedRoom.ownerUsername}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Ngày tạo</span>
                <strong>{selectedRoom.createdAt ? new Date(selectedRoom.createdAt).toLocaleDateString('vi-VN') : '—'}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Thành viên</span>
                <strong>{selectedRoom.members?.length ?? 0} người</strong>
              </div>
            </div>
            <div className={styles.membersList}>
              <div className={styles.membersTitle}>Thành viên</div>
              {selectedRoom.members?.map((m, i) => (
                <div key={i} className={styles.memberItem}>
                  <div className={styles.memberAvatar}>{m.username?.[0]?.toUpperCase()}</div>
                  <span>@{m.username}</span>
                  <span className={styles.memberRole}>{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {roomsTotalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={roomsPage === 0} onClick={() => { dispatch(setRoomsPage(roomsPage - 1)); load(roomsPage - 1); }}>← Trước</button>
          {Array.from({ length: roomsTotalPages }, (_, i) => (
            <button key={i} className={`${styles.pageBtn} ${i === roomsPage ? styles.pageActive : ''}`} onClick={() => { dispatch(setRoomsPage(i)); load(i); }}>{i + 1}</button>
          ))}
          <button className={styles.pageBtn} disabled={roomsPage >= roomsTotalPages - 1} onClick={() => { dispatch(setRoomsPage(roomsPage + 1)); load(roomsPage + 1); }}>Sau →</button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xoá phòng chat?"
        message={`Xoá phòng "${deleteTarget?.name}" sẽ xoá toàn bộ tin nhắn trong phòng. Không thể hoàn tác!`}
        confirmLabel="Xoá phòng"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
