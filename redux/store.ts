import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import a from './authSlice';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    auth : a
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
