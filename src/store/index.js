// Redux store for managing application state
import { configureStore } from '@reduxjs/toolkit';
import newsReducer from './slices/newsSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    news: newsReducer,
    auth: authReducer,
    ui: uiReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
