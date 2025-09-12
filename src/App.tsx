import { Assets as NavigationAssets } from '@react-navigation/elements';
import { ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Asset } from 'expo-asset';
import * as React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { Loading } from './components/Loading';
import { SplashAnimation } from './components/SplashAnimation';
import { queryClient } from './configs/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ImageUploadProvider } from './contexts/ImageUploadContext';
import { InitDataProvider } from './contexts/InitData';
import { LoadingProvider } from './contexts/LoadingContext';
import { NetworkProvider } from './contexts/NetworkContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { useTheme } from './hooks/useTheme';
import { Navigation } from './navigation';
// import { configurePushNotifications } from './services/NotificationService';
import { store } from './store';
import { NetworkStatusBar } from './components/NetworkStatusBar';
import { AsignedProvider } from './contexts/AsignedContext';
import { UpdateProvider } from './contexts/UpdateContext';
import { SocketProvider } from './contexts/SocketContext';

// Load all assets
Asset.loadAsync([...NavigationAssets]);

// Cấu hình notifications ngay khi app khởi động
// configurePushNotifications();

// Note: For notifications to work properly, add a notification.wav file in the assets folder
// For example, download a notification sound and place it at assets/notification.wav

function AppContent() {
  const [isReady, setIsReady] = React.useState(false);
  const theme = useTheme();

  return (
    <ThemeProvider value={theme}>
      <SocketProvider>
        <AuthProvider>
          <NotificationProvider>
            <InitDataProvider>
              <AsignedProvider>
                <ImageUploadProvider>
                  <SidebarProvider>
                    <UpdateProvider>
                      {/* {isReady ? (
                        <>
                          <Navigation
                            linking={{
                              enabled: 'auto',
                              prefixes: ['trueadspos://'],
                            }}
                          />
                        </>
                      ) : ( */}
                      <SplashAnimation setIsReady={setIsReady} />
                      {/* )} */}
                    </UpdateProvider>
                  </SidebarProvider>
                </ImageUploadProvider>
              </AsignedProvider>
            </InitDataProvider>
          </NotificationProvider>
        </AuthProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SettingsProvider>
            <LoadingProvider>
              <NetworkProvider>
                <NetworkStatusBar />
                <AppContent />
                <Loading />
              </NetworkProvider>
            </LoadingProvider>
          </SettingsProvider>
        </GestureHandlerRootView>
      </Provider>
    </QueryClientProvider>
  );
}
