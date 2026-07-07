import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Dashboard
  stats: null,
  statsLoading: false,

  // Users
  users: [],
  usersTotalPages: 0,
  usersTotalElements: 0,
  usersPage: 0,
  usersSearch: '',
  usersLoading: false,

  // Rooms
  rooms: [],
  roomsTotalPages: 0,
  roomsTotalElements: 0,
  roomsPage: 0,
  roomsLoading: false,
  selectedRoom: null,

  // Messages
  messages: [],
  messagesTotalPages: 0,
  messagesTotalElements: 0,
  messagesPage: 0,
  messagesFilter: { type: '', sender: '', receiver: '' },
  messagesLoading: false,

  // Global error
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Stats
    setStatsLoading(state, action) { state.statsLoading = action.payload; },
    setStats(state, action) { state.stats = action.payload; },

    // Users
    setUsersLoading(state, action) { state.usersLoading = action.payload; },
    setUsers(state, action) {
      const { content, totalPages, totalElements, number } = action.payload;
      state.users = content;
      state.usersTotalPages = totalPages;
      state.usersTotalElements = totalElements;
      state.usersPage = number;
    },
    setUsersPage(state, action) { state.usersPage = action.payload; },
    setUsersSearch(state, action) { state.usersSearch = action.payload; },
    updateUserInList(state, action) {
      const updated = action.payload;
      const idx = state.users.findIndex((u) => u.id === updated.id);
      if (idx !== -1) state.users[idx] = updated;
    },
    removeUserFromList(state, action) {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },

    // Rooms
    setRoomsLoading(state, action) { state.roomsLoading = action.payload; },
    setRooms(state, action) {
      const { content, totalPages, totalElements, number } = action.payload;
      state.rooms = content;
      state.roomsTotalPages = totalPages;
      state.roomsTotalElements = totalElements;
      state.roomsPage = number;
    },
    setRoomsPage(state, action) { state.roomsPage = action.payload; },
    setSelectedRoom(state, action) { state.selectedRoom = action.payload; },
    removeRoomFromList(state, action) {
      state.rooms = state.rooms.filter((r) => r.name !== action.payload);
    },

    // Messages
    setMessagesLoading(state, action) { state.messagesLoading = action.payload; },
    setMessages(state, action) {
      const { content, totalPages, totalElements, number } = action.payload;
      state.messages = content;
      state.messagesTotalPages = totalPages;
      state.messagesTotalElements = totalElements;
      state.messagesPage = number;
    },
    setMessagesPage(state, action) { state.messagesPage = action.payload; },
    setMessagesFilter(state, action) {
      state.messagesFilter = { ...state.messagesFilter, ...action.payload };
    },
    removeMessageFromList(state, action) {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
    },
    updateMessageInList(state, action) {
      const updated = action.payload;
      const idx = state.messages.findIndex((m) => m.id === updated.id);
      if (idx !== -1) state.messages[idx] = updated;
    },

    // Error
    setError(state, action) { state.error = action.payload; },
    clearError(state) { state.error = null; },
  },
});

export const {
  setStatsLoading, setStats,
  setUsersLoading, setUsers, setUsersPage, setUsersSearch,
  updateUserInList, removeUserFromList,
  setRoomsLoading, setRooms, setRoomsPage, setSelectedRoom, removeRoomFromList,
  setMessagesLoading, setMessages, setMessagesPage, setMessagesFilter,
  removeMessageFromList, updateMessageInList,
  setError, clearError,
} = adminSlice.actions;

export default adminSlice.reducer;
