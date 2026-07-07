import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useApi } from '../../../app/providers/useApi.js';
import { createAdminService } from '../services/adminService.js';
import {
  setUsers, setUsersLoading, setUsersPage, setUsersSearch,
  updateUserInList, removeUserFromList, setError,
} from '../../../state/admin/adminSlice.js';
import ConfirmModal from './ConfirmModal.jsx';
import EditUserModal from './EditUserModal.jsx';
import Pagination from '../../../shared/components/Pagination.jsx';
import styles from './UsersTab.module.css';

const ROLE_COLOR = { ADMIN: '#6366f1', USER: '#64748b' };
const STATUS_COLOR = {
  ONLINE: '#10b981', OFFLINE: '#94a3b8', AWAY: '#f59e0b', BANNED: '#ef4444',
};

export default function UsersTab() {
  const dispatch = useDispatch();
  const { actions } = useApi();
  const { users, usersPage, usersTotalPages, usersTotalElements, usersLoading, usersSearch } =
    useSelector((s) => s.admin);

  const [searchInput, setSearchInput] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const adminSvc = createAdminService(actions);

  const load = async (page = usersPage, search = usersSearch) => {
    dispatch(setUsersLoading(true));
    try {
      const res = await adminSvc.getUsers(page, 10, search);
      dispatch(setUsers(res?.data || res));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setUsersLoading(false));
    }
  };

  useEffect(() => { load(0, ''); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setUsersSearch(searchInput));
    dispatch(setUsersPage(0));
    load(0, searchInput);
  };

  const handlePage = (p) => {
    dispatch(setUsersPage(p));
    load(p, usersSearch);
  };

  const handleSaveUser = async (fields) => {
    try {
      const res = await adminSvc.updateUser(editUser.id, fields);
      dispatch(updateUserInList(res?.data || res));
      setEditUser(null);
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminSvc.deleteUser(deleteTarget.id);
      dispatch(removeUserFromList(deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Người dùng</h2>
          <p className={styles.subtitle}>{usersTotalElements} tài khoản trong hệ thống</p>
        </div>
        <form className={styles.searchForm} onSubmit={handleSearch} id="users-search-form">
          <input
            id="users-search-input"
            className={styles.searchInput}
            placeholder="Tìm kiếm username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn} id="users-search-btn">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </form>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Người dùng</th>
              <th>Username</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {usersLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className={styles.skeletonRow}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j}><span className={styles.skeleton} /></td>
                    ))}
                  </tr>
                ))
              : users.map((u) => (
                  <tr key={u.id} className={styles.row}>
                    <td className={styles.idCell}>#{u.id}</td>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>
                          {u.avatar
                            ? <img src={u.avatar} alt={u.username} />
                            : <span>{(u.displayName || u.username || '?')[0].toUpperCase()}</span>
                          }
                        </div>
                        <span className={styles.displayName}>{u.displayName || u.username}</span>
                      </div>
                    </td>
                    <td className={styles.usernameCell}>@{u.username}</td>
                    <td>
                      <span
                        className={styles.badge}
                        style={{ background: `${ROLE_COLOR[u.role] || '#64748b'}18`, color: ROLE_COLOR[u.role] || '#64748b' }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <div className={styles.statusCell}>
                        <span
                          className={styles.statusDot}
                          style={{ background: STATUS_COLOR[u.status] || '#94a3b8' }}
                        />
                        {u.status}
                      </div>
                    </td>
                    <td className={styles.dateCell}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.editBtn}
                          onClick={() => setEditUser(u)}
                          title="Chỉnh sửa"
                          id={`edit-user-${u.id}`}
                        >
                          ✏️
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => setDeleteTarget(u)}
                          title="Xoá"
                          id={`delete-user-${u.id}`}
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

      {/* Pagination */}
      <Pagination
        page={usersPage}
        totalPages={usersTotalPages}
        onPageChange={handlePage}
      />

      {/* Modals */}
      <EditUserModal
        isOpen={!!editUser}
        user={editUser}
        onSave={handleSaveUser}
        onClose={() => setEditUser(null)}
      />
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xoá người dùng?"
        message={`Bạn chắc muốn xoá tài khoản "@${deleteTarget?.username}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
