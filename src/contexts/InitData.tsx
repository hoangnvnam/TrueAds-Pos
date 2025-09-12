import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
interface InitDataContextType {
  storeDomain: any;
  purchase: boolean;
  setPurchased: (purchased: boolean) => void;

  setStoreDomain: (domain: any) => void;
}

const InitDataContext = createContext<InitDataContextType | undefined>(undefined);

export const InitDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [storeDomain, setStoreDomain] = useState<any>(null);

  const [purchase, setPurchased] = useState<boolean>(false);

  const { authChild } = useAuth();

  useEffect(() => {
    const getInitData = async () => {
      const storeDomain = await AsyncStorage.getItem('storeDomain');
      if (authChild) {
        setStoreDomain(storeDomain || null);

        return {
          storeDomain,
        };
      } else {
      }
    };
    getInitData();
  }, [authChild]);
  return (
    <InitDataContext.Provider
      value={{
        storeDomain,
        setStoreDomain,
        purchase,
        setPurchased,
      }}
    >
      {children}
    </InitDataContext.Provider>
  );
};

export const useInitData = () => {
  const context = useContext(InitDataContext);
  if (context === undefined) {
    throw new Error('useInitData must be used within an InitDataProvider');
  }
  return context;
};
