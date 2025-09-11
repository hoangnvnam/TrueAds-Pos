import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Thêm các selectors tiện ích
export const selectSettings = (state: RootState) => state.settings;
export const selectIsDarkMode = (state: RootState) => state.settings.isDarkMode;
export const selectCallNotification = (state: RootState) => state.settings.callNotification;
export const selectUpdateNotification = (state: RootState) => state.settings.updateNotification;
export const selectSoundNotification = (state: RootState) => state.settings.soundNotification; 