import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { registerForPushNotificationsAsync, scheduleLocalNotification } from '../services/NotificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  expoPushToken: string | undefined;
  notification: Notifications.Notification | null;
  showNotification: (title: string, body: string, data?: any) => Promise<void>;
  appState: AppStateStatus;
  gotoMessages: any;
  setGotoMessages: React.Dispatch<React.SetStateAction<any>>;
  reloadConversation: boolean;
  setReloadConversation: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: undefined,
  notification: null,
  showNotification: async () => {},
  appState: AppState.currentState,
  gotoMessages: null,
  setGotoMessages: () => {},
  reloadConversation: false,
  setReloadConversation: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authInfo } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const appStateListener = useRef<any>(null);
  const [gotoMessages, setGotoMessages] = useState<any>(null);
  const initialNotificationChecked = useRef(false);
  const [reloadConversation, setReloadConversation] = useState(false);
  useEffect(() => {
    if (!initialNotificationChecked.current) {
      initialNotificationChecked.current = true;

      Notifications.getLastNotificationResponseAsync().then((response) => {
        if (response) {
          if (
            response.notification.request.content.data.action !== 'goto_messages' &&
            response.notification.request.content.data?.conversationid
          ) {
            setGotoMessages(response.notification.request.content.data);
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    appStateListener.current = AppState.addEventListener('change', handleAppStateChange);

    if (authInfo?.id) {
      registerForPushNotificationsAsync(authInfo?.id).then((token) => {
        if (token) {
          setExpoPushToken(token);
        }
      });

      notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {});

      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        if (response.notification.request.content.data.action === 'goto_messages') {
          setGotoMessages(response.notification.request.content.data.data);
          setReloadConversation(true);
        } else if (response.notification.request.content.data?.conversationid) {
          setGotoMessages(response.notification.request.content.data);
        }
      });
    } else {
      setExpoPushToken(undefined);
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      if (appStateListener.current) {
        appStateListener.current.remove();
      }
    };
  }, [authInfo?.id]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    setAppState(nextAppState);
  };

  const showNotification = async (title: string, body: string, data: any = {}) => {
    await scheduleLocalNotification(title, body, data);
  };

  const value = {
    expoPushToken,
    notification,
    showNotification,
    appState,
    gotoMessages,
    setGotoMessages,
    reloadConversation,
    setReloadConversation,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
