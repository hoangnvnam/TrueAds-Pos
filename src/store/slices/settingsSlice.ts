import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsState } from '../index';

// Giá trị mặc định cho state
const initialState: SettingsState = {
  isDarkMode: false,
  callNotification: true,
  updateNotification: true,
  soundNotification: 'Mặc định',
};

// Hàm lưu settings vào AsyncStorage
const saveSettingsToStorage = async (settings: SettingsState) => {
  try {
    await AsyncStorage.setItem('settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings to storage:', error);
  }
};

// Tạo slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Action để toggle dark mode
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      // Lưu toàn bộ settings vào AsyncStorage
      saveSettingsToStorage(state);
    },
    
    // Action để set dark mode
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      // Lưu toàn bộ settings vào AsyncStorage
      saveSettingsToStorage(state);
    },
    
    // Action để toggle call notification
    toggleCallNotification: (state) => {
      state.callNotification = !state.callNotification;
      // Lưu toàn bộ settings vào AsyncStorage
      saveSettingsToStorage(state);
    },
    
    // Action để toggle update notification
    toggleUpdateNotification: (state) => {
      state.updateNotification = !state.updateNotification;
      // Lưu toàn bộ settings vào AsyncStorage
      saveSettingsToStorage(state);
    },
    
    // Action để set sound notification
    setSoundNotification: (state, action: PayloadAction<string>) => {
      state.soundNotification = action.payload;
      // Lưu toàn bộ settings vào AsyncStorage
      saveSettingsToStorage(state);
    },
    
    // Action để load settings từ AsyncStorage
    loadSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

// Export các actions
export const {
  toggleDarkMode,
  setDarkMode,
  toggleCallNotification,
  toggleUpdateNotification,
  setSoundNotification,
  loadSettings,
} = settingsSlice.actions;

// Export reducer
export default settingsSlice.reducer; 