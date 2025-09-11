import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseStorageOptions {
  key: string;
  defaultValue?: any;
}

export function useStorage<T>({ key, defaultValue }: UseStorageOptions) {
  // Get value from storage
  const getValue = async (): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(`Error getting value for key ${key}:`, error);
      return defaultValue;
    }
  };

  // Set value to storage
  const setValue = async (value: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting value for key ${key}:`, error);
    }
  };

  // Remove value from storage
  const removeValue = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing value for key ${key}:`, error);
    }
  };

  // Clear all storage
  const clearAll = async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  return {
    getValue,
    setValue,
    removeValue,
    clearAll,
  };
} 