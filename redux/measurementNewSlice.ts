import { createSlice } from '@reduxjs/toolkit';

export const measurementSlice = createSlice({
  name: 'measurementnew',
  initialState: {
    measurementId: null,
    duration: 0,
    explored: 0,
    startTime: 0,
  },
  reducers: {
    startMeasurement: (state, action) => {
      state.measurementId = action.payload;
      state.explored = 0;
      state.startTime = Date.now();
    },
    initDuration: (state, action) => {
      state.duration = action.payload;
    },
    stopMeasurement: (state) => {
      if (state.startTime) {
        //state.duration = Math.floor((Date.now() - state.startTime) / 1000);
        state.startTime = 0;
      }
    },
    incrementDuration: (state, action) => {
      if (state.measurementId) {
        state.duration = action.payload;
      }
    },
    updateExplored: (state, action) => {
      if (state.measurementId) {
        state.explored = action.payload;
      }
    },
  },
});

export const { startMeasurement, initDuration, stopMeasurement, incrementDuration, updateExplored } = measurementSlice.actions;
export default measurementSlice.reducer;
