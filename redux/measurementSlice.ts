import { createSlice } from '@reduxjs/toolkit';
import socketManager from './websocketManager';
import { store } from './store';

export const measurementSlice = createSlice({
  name: 'measurement',
  initialState: {
    activeMeasurement: 12,
    duration: 0,
    explored: 0,
    socketConnected: false,
  },
  reducers: {
    startMeasurement: (state, action) => {
      state.activeMeasurement = action.payload;
      state.duration = 0;
      state.explored = 0;

      socketManager.sendMessage({
        type: 'startMeasurement',
        measurementId: action.payload,
      });
    },
    stopMeasurement: (state) => {
      if (state.activeMeasurement) {
        socketManager.sendMessage({
          type: 'stopMeasurement',
          measurementId: state.activeMeasurement,
        });
      }
      state.activeMeasurement = 0;
      state.duration = 0;
      state.explored = 0;
    },
    incrementDuration: (state) => {
      if (state.activeMeasurement) {
        state.duration += 1;

        socketManager.sendMessage({
          type: 'updateMeasurement',
          measurementId: state.activeMeasurement,
          duration: state.duration,
          explored: state.explored,
        });

        console.log("Attempt to increment from Redux state");
      }
    },
    updateExplored: (state, action) => {
      if (state.activeMeasurement) {
        state.explored = action.payload;

        socketManager.sendMessage({
          type: 'updateMeasurement',
          measurementId: state.activeMeasurement,
          duration: state.duration,
          explored: state.explored,
        });
      }
    },
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    }
  }
});

socketManager.onOpen(() => {
  console.log('WebSocket connection established');
  store.dispatch(setSocketConnected(true));
});

socketManager.onMessage((event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'measurementUpdated') {
    console.log('Measurement updated:', message);
  }
});

socketManager.onError((error) => {
  console.error('WebSocket error:', error);
});

socketManager.onClose(() => {
  console.log('WebSocket connection closed');
  store.dispatch(setSocketConnected(false));
});

export const { startMeasurement, stopMeasurement, incrementDuration, updateExplored, setSocketConnected } = measurementSlice.actions;
export default measurementSlice.reducer;
