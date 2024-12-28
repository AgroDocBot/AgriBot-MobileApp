import { createSlice } from '@reduxjs/toolkit';

interface SettingsState {
  language: string;
  controlStyle: 'keypad' | 'wheel';
  unitsSystem : 'metric' | 'imperial'
}

const initialState: SettingsState = {
  language: 'English',
  controlStyle: 'keypad',
  unitsSystem: 'metric',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    toggleControlStyle: (state) => {
      state.controlStyle = state.controlStyle === 'keypad' ? 'wheel' : 'keypad';
    },
    toggleUnitsSystem: (state) => {
      state.unitsSystem = state.unitsSystem === 'metric' ? 'imperial' : 'metric';
    }
  },
});

export const { setLanguage, toggleControlStyle, toggleUnitsSystem } = settingsSlice.actions;
export default settingsSlice.reducer;
