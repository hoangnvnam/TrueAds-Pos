import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = 'https://adsdata.trueads.vn';
const SOCKET_SERVER_URL_CASHIER = 'https://adsdata.trueads.vn/cashier';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  cashierSocket: Socket | null;
  isCashierConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [cashierSocket, setCashierSocket] = useState<Socket | null>(null);
  const [isCashierConnected, setIsCashierConnected] = useState(false);

  useEffect(() => {
    // Main socket connection
    const mainSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: 5,
      timeout: 10000,
      withCredentials: true,
      forceNew: false,
      autoConnect: true,
    });

    // Cashier socket connection
    const cashierSocketInstance = io(SOCKET_SERVER_URL_CASHIER, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: 5,
      timeout: 10000,
      withCredentials: true,
      forceNew: false,
      autoConnect: true,
    });

    setSocket(mainSocket);
    setCashierSocket(cashierSocketInstance);

    // Main socket event handlers
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleConnectError = (error: any) => {
      console.log('Error main socket connect', error);
      setIsConnected(false);
    };

    // Cashier socket event handlers
    const handleCashierConnect = () => setIsCashierConnected(true);
    const handleCashierDisconnect = () => setIsCashierConnected(false);
    const handleCashierConnectError = (error: any) => {
      console.log('Error cashier socket connect', error);
      setIsCashierConnected(false);
    };

    // Attach event listeners
    mainSocket.on('connect', handleConnect);
    mainSocket.on('disconnect', handleDisconnect);
    mainSocket.on('connect_error', handleConnectError);

    cashierSocketInstance.on('connect', handleCashierConnect);
    cashierSocketInstance.on('disconnect', handleCashierDisconnect);
    cashierSocketInstance.on('connect_error', handleCashierConnectError);

    return () => {
      mainSocket.off('connect', handleConnect);
      mainSocket.off('disconnect', handleDisconnect);
      mainSocket.off('connect_error', handleConnectError);
      mainSocket.disconnect();

      cashierSocketInstance.off('connect', handleCashierConnect);
      cashierSocketInstance.off('disconnect', handleCashierDisconnect);
      cashierSocketInstance.off('connect_error', handleCashierConnectError);
      cashierSocketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        cashierSocket,
        isCashierConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
