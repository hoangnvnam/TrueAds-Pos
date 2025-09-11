import * as Network from 'expo-network';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface NetworkContextType {
  isConnected: boolean;
  isPoorConnection: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  isPoorConnection: false,
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isPoorConnection, setIsPoorConnection] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setIsConnected(!!networkState.isConnected);
        setIsPoorConnection(networkState.isInternetReachable === false);
      } catch (error) {
        console.error('Network check error:', error);
      }
    };

    checkNetwork();

    const interval = setInterval(checkNetwork, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <NetworkContext.Provider value={{ isConnected, isPoorConnection }}>{children}</NetworkContext.Provider>;
};
