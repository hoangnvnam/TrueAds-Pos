import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import cartReducer, { CartState } from './slices/cartSlice';
import addressReducer, { AddressState } from './slices/addressSlice';

// Định nghĩa kiểu dữ liệu cho state
export interface SettingsState {
  isDarkMode: boolean;
  callNotification: boolean;
  updateNotification: boolean;
  soundNotification: string;
}

// Định nghĩa kiểu dữ liệu cho RootState
export interface RootState {
  settings: SettingsState;
  cart: CartState;
  address: AddressState;
}

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    cart: cartReducer,
    address: addressReducer,
    // Thêm các reducers khác ở đây khi cần
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppDispatch = typeof store.dispatch;
