import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect } from "react";
import { StatusBar } from "react-native";
import { SettingsState } from "~/store";
import {
  selectIsDarkMode,
  useAppDispatch,
  useAppSelector,
} from "~/store/hooks";
import { loadSettings, toggleDarkMode } from "~/store/slices/settingsSlice";

interface SettingsContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(selectIsDarkMode);

  useEffect(() => {
    // Load saved settings
    loadSavedSettings();
  }, []);

  const loadSavedSettings = async () => {
    try {
      const savedSettingsJson = await AsyncStorage.getItem("settings");
      if (savedSettingsJson !== null) {
        const savedSettings = JSON.parse(savedSettingsJson) as SettingsState;
        dispatch(loadSettings(savedSettings));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <SettingsContext.Provider
      value={{ isDarkMode, toggleDarkMode: handleToggleDarkMode }}
    >
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle={isDarkMode ? "light-content" : "dark-content"}
      />
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
