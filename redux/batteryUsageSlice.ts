import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://agribot-backend-abck.onrender.com/robot-data';

interface BatteryUsageState {
  battery: number;
  power: number;
  voltage: number;
  lastConnection: number | null;
  sessionDuration: number;
}

const initialState: BatteryUsageState = {
  battery: 0,
  power: 0,
  voltage: 0,
  lastConnection: null,
  sessionDuration: 0,
};

// Ensure RobotData exists (create if missing)
export const createOrUpdateRobotData = createAsyncThunk(
  'battery/createOrUpdateRobotData',
  async (userId: number) => {
    await axios.post(`${API_URL}/${userId}`);
  }
);

// Update battery level
export const updateBattery = createAsyncThunk(
  'battery/updateBattery',
  async ({ userId, battery }: { userId: number; battery: number }) => {
    await axios.put(`${API_URL}/battery/${userId}`, { lastBattery: battery });
  }
);

// Update usage duration
export const updateUsage = createAsyncThunk(
  'battery/updateUsage',
  async ({ userId, timeUsed }: { userId: number; timeUsed: number }) => {
    await axios.put(`${API_URL}/usage/${userId}`, { timeUsed });
  }
);

const batteryUsageSlice = createSlice({
  name: 'battery',
  initialState,
  reducers: {
    setBatteryStatus: (state, action: PayloadAction<Omit<BatteryUsageState, 'lastConnection' | 'sessionDuration'>>) => {
      state.battery = action.payload.battery;
      state.power = action.payload.power;
      state.voltage = action.payload.voltage;
    },
    setLastConnection: (state, action: PayloadAction<number>) => {
      state.lastConnection = action.payload;
    },
    setSessionDuration: (state, action: PayloadAction<number>) => {
      state.sessionDuration += action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateUsage.fulfilled, (state, action) => {
      state.sessionDuration += action.meta.arg.timeUsed;
    });
    builder.addCase(updateBattery.fulfilled, (state, action) => {
      state.battery = action.meta.arg.battery;
    });
  },
});

export const { setBatteryStatus, setLastConnection, setSessionDuration } = batteryUsageSlice.actions;
export default batteryUsageSlice.reducer;
