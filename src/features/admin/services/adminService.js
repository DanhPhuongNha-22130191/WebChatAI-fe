/**
 * Admin Service — gọi tất cả API /admin/* thông qua apiActions (ApiContext)
 */
export const createAdminService = (apiActions) => ({
  // ── Dashboard ──────────────────────────────────────────────
  getStats: () => apiActions.get('/admin/stats'),

  // ── Users ──────────────────────────────────────────────────
  getUsers: (page = 0, size = 20, search = '') => {
    let url = `/admin/users?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return apiActions.get(url);
  },

  getUserById: (id) => apiActions.get(`/admin/users/${id}`),

  updateUser: (id, data) => apiActions.put(`/admin/users/${id}`, data),

  deleteUser: (id) => apiActions.delete(`/admin/users/${id}`),

  // ── Rooms ──────────────────────────────────────────────────
  getRooms: (page = 0, size = 20) =>
    apiActions.get(`/admin/rooms?page=${page}&size=${size}`),

  getRoomDetail: (name) =>
    apiActions.get(`/admin/rooms/${encodeURIComponent(name)}`),

  deleteRoom: (name) =>
    apiActions.delete(`/admin/rooms/${encodeURIComponent(name)}`),

  // ── Messages ───────────────────────────────────────────────
  searchMessages: ({ type = '', sender = '', receiver = '', page = 0, size = 20 } = {}) => {
    const params = new URLSearchParams({ page, size });
    if (type) params.set('type', type);
    if (sender) params.set('sender', sender);
    if (receiver) params.set('receiver', receiver);
    return apiActions.get(`/admin/messages?${params.toString()}`);
  },

  deleteMessage: (id) => apiActions.delete(`/admin/messages/${id}`),

  recallMessage: (id) => apiActions.patch(`/admin/messages/${id}/recall`),
});
