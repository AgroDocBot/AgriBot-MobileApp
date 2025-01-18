import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MeasurementState {
  currentMeasurementId: number | null;
  duration: number; // in seconds
}

const initialState: MeasurementState = {
  currentMeasurementId: null,
  duration: 0,
};

const measurementSlice = createSlice({
  name: 'measurement',
  initialState,
  reducers: {
    startMeasurement: (state, action: PayloadAction<number>) => {
      state.currentMeasurementId = action.payload;
      state.duration = 0;
    },
    stopMeasurement: (state) => {
      state.currentMeasurementId = null;
      state.duration = 0;
    },
    incrementDuration: (state) => {
      if (state.currentMeasurementId) {
        state.duration += 1;
      }
    },
  },
});

export const { startMeasurement, stopMeasurement, incrementDuration } = measurementSlice.actions;
export default measurementSlice.reducer;
