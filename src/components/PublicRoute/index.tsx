import React from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { authInfo, authChild } = useAuth();

  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const isLoginScreen = navigation.getState().routes[0].name === 'Login';
  const isPrintScreen = navigation.getState().routes[navigation.getState().routes.length - 1].name === 'Print';
  React.useEffect(() => {
    if (authInfo) {
      if (authChild) {
        if (isLoginScreen) {
          navigation.replace('ServiceSelection');
        }
        // navigation.replace('HomeTabs');
      } else {
        navigation.replace('AccessToStore');
      }
    }
  }, [authInfo, authChild]);

  if (authInfo && !isPrintScreen) {
    return null;
  }

  return <>{children}</>;
}
