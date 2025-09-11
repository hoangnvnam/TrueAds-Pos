import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useSocketContext } from './SocketContext';
interface InitDataContextType {
  fbResponse: any;
  zaloResponse: any;
  storeDomain: any;
  purchase: boolean;
  setPurchased: (purchased: boolean) => void;
  setFbResponse: (response: any) => void;
  setZaloResponse: (response: any) => void;
  setStoreDomain: (domain: any) => void;
}

const InitDataContext = createContext<InitDataContextType | undefined>(undefined);

export const InitDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fbResponse, setFbResponse] = useState<any>(null);
  const [zaloResponse, setZaloResponse] = useState<any>(null);
  const [storeDomain, setStoreDomain] = useState<any>(null);

  const [purchase, setPurchased] = useState<boolean>(false);

  const { authChild } = useAuth();
  const { socket } = useSocketContext();

  useEffect(() => {
    const getInitData = async () => {
      const storeDomain = await AsyncStorage.getItem('storeDomain');
      if (authChild) {
        const fbAuthResponse = await AsyncStorage.getItem('fbAuthResponse');
        const zaloAuthResponse = await AsyncStorage.getItem('zaloAuthResponse');

        setFbResponse(JSON.parse(fbAuthResponse || '{}'));
        setZaloResponse(JSON.parse(zaloAuthResponse || '{}'));
        setStoreDomain(storeDomain || null);

        socket?.emit('joinRoomWebsite', {
          id: `website-${storeDomain?.replace('https://', '')}`,
        });

        return {
          fbResponse,
          zaloResponse,
          storeDomain,
        };
      } else {
        setFbResponse(null);
        setZaloResponse(null);
        if (storeDomain) {
          socket?.emit('leaveRoomWebsite', {
            id: `website-${storeDomain?.replace('https://', '')}`,
          });
        }
      }
    };
    getInitData();
  }, [authChild]);
  return (
    <InitDataContext.Provider
      value={{
        fbResponse,
        zaloResponse,
        setFbResponse,
        setZaloResponse,
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
