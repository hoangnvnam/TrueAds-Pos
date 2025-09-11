import React, { createContext, useContext, useState } from 'react';
import Toast, { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import { useTheme } from '~/hooks/useTheme';
interface LoadingContextType {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);
  const theme = useTheme();
  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          backgroundColor: theme.colors.background,
          borderLeftColor: '#69C779',
        }}
        text1Style={{
          color: theme.colors.text,
          fontSize: 14,
          fontWeight: '500',
        }}
      />
    ),

    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          backgroundColor: theme.colors.background,
          borderLeftColor: '#FE6301',
        }}
        text1Style={{
          color: theme.colors.text,
          fontSize: 14,
          fontWeight: '500',
        }}
      />
    ),
    warning: (props: any) => (
      <InfoToast
        {...props}
        style={{
          backgroundColor: theme.colors.background,
          borderLeftColor: '#cc3300',
        }}
        text1Style={{
          color: theme.colors.text,
          fontSize: 14,
          fontWeight: '500',
        }}
      />
    ),
  };
  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
      <Toast config={toastConfig} />
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
