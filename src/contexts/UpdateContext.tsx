import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { applyUpdate, checkForUpdates } from '../services/UpdateService';

interface UpdateContextProps {
  isCheckingUpdate: boolean;
  hasUpdate: boolean;
  checkUpdate: () => Promise<void>;
  applyUpdateNow: () => Promise<void>;
}

const UpdateContext = createContext<UpdateContextProps | undefined>(undefined);

interface UpdateProviderProps {
  children: ReactNode;
}

export const UpdateProvider: React.FC<UpdateProviderProps> = ({ children }) => {
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);

  const checkUpdate = async (): Promise<void> => {
    if (isCheckingUpdate) return;

    try {
      setIsCheckingUpdate(true);
      const updateAvailable = await checkForUpdates();
      setHasUpdate(updateAvailable);
    } catch (error) {
      console.log('Lỗi khi kiểm tra cập nhật:', error);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const applyUpdateNow = async (): Promise<void> => {
    await applyUpdate();
  };

  // Kiểm tra cập nhật khi component mount
  useEffect(() => {
    if (!__DEV__) {
      checkUpdate();
    }
  }, []);

  return (
    <UpdateContext.Provider
      value={{
        isCheckingUpdate,
        hasUpdate,
        checkUpdate,
        applyUpdateNow,
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
};

export const useUpdate = (): UpdateContextProps => {
  const context = useContext(UpdateContext);

  if (context === undefined) {
    throw new Error('useUpdate must be used within an UpdateProvider');
  }

  return context;
};
