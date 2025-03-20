import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import a from './authSlice';
import measurementReducer from './measurementSlice';
import batterySlice from './batteryUsageSlice';
import { ThunkDispatch } from '@reduxjs/toolkit';
import measurementNewSlice from './measurementNewSlice';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    auth : a,
    measurement: measurementReducer,
    battery: batterySlice,
    measurementnew: measurementNewSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
