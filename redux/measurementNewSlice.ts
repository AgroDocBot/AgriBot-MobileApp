import { createSlice } from '@reduxjs/toolkit';

export const measurementSlice = createSlice({
  name: 'measurementnew',
  initialState: {
    measurementId: null,
    duration: 0,
    explored: 0,
  },
  reducers: {
    startMeasurement: (state, action) => {
      state.measurementId = action.payload;
      state.duration = new Date().getMinutes();
      state.explored = 0;
    },
    stopMeasurement: (state) => {
      state.measurementId = null;
      state.duration = 0;
      state.explored = 0;
    },
    incrementDuration: (state) => {
      if (state.measurementId) {
        state.duration += 1;
      }
    },
    updateExplored: (state, action) => {
      if (state.measurementId) {
        state.explored = action.payload;
      }
    },
  },
});

export const { startMeasurement, stopMeasurement, incrementDuration, updateExplored } = measurementSlice.actions;
export default measurementSlice.reducer;
