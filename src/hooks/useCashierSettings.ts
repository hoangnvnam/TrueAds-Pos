import { useEffect, useState } from 'react';
import { useStorage } from './useStorage';

export interface CashierSettings {
  productViewMode: 'grid' | 'list';
  viewMode: 'split' | 'fullscreen';
  autoPrint: boolean;
}

const DEFAULT_SETTINGS: CashierSettings = {
  productViewMode: 'grid',
  viewMode: 'split',
  autoPrint: false,
};

export function useCashierSettings() {
  const [settings, setSettings] = useState<CashierSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  const storage = useStorage<CashierSettings>({
    key: 'cashier_settings',
    defaultValue: DEFAULT_SETTINGS,
  });

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await storage.getValue();
        if (savedSettings) {
          setSettings(savedSettings);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading cashier settings:', error);
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Save settings to storage
  const updateSettings = async (newSettings: Partial<CashierSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await storage.setValue(updatedSettings);
    } catch (error) {
      console.error('Error saving cashier settings:', error);
    }
  };

  // Update individual setting
  const updateProductViewMode = (mode: 'grid' | 'list') => {
    updateSettings({ productViewMode: mode });
  };

  const updateViewMode = (mode: 'split' | 'fullscreen') => {
    updateSettings({ viewMode: mode });
  };

  const updateAutoPrint = (enabled: boolean) => {
    updateSettings({ autoPrint: enabled });
  };

  // Reset to default settings
  const resetSettings = async () => {
    try {
      setSettings(DEFAULT_SETTINGS);
      await storage.setValue(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Error resetting cashier settings:', error);
    }
  };

  return {
    settings,
    isLoaded,
    updateSettings,
    updateProductViewMode,
    updateViewMode,
    updateAutoPrint,
    resetSettings,
  };
}
