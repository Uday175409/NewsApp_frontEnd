import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'light',
    sidebarOpen: false,
    notifications: [],
    toasts: [],
    modals: {
      articleModal: {
        isOpen: false,
        article: null,
      },
      profileModal: {
        isOpen: false,
      },
    },
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    addToast: (state, action) => {
      const toast = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.toasts.push(toast);
      
      // Limit to 5 toasts max
      if (state.toasts.length > 5) {
        state.toasts.shift();
      }
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    openArticleModal: (state, action) => {
      console.log('🔥 Opening article modal with:', action.payload?.title);
      console.log('🔥 Current modal state before:', state.modals.articleModal);
      state.modals.articleModal.isOpen = true;
      state.modals.articleModal.article = action.payload;
      console.log('🔥 Current modal state after:', state.modals.articleModal);
    },
    closeArticleModal: (state) => {
      state.modals.articleModal.isOpen = false;
      state.modals.articleModal.article = null;
    },
    openProfileModal: (state) => {
      state.modals.profileModal.isOpen = true;
    },
    closeProfileModal: (state) => {
      state.modals.profileModal.isOpen = false;
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  addNotification,
  removeNotification,
  addToast,
  removeToast,
  clearToasts,
  openArticleModal,
  closeArticleModal,
  openProfileModal,
  closeProfileModal,
} = uiSlice.actions;

export default uiSlice.reducer;
