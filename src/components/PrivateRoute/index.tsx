import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { useAuth } from '~/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { authInfo } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    if (!authInfo) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [authInfo]);

  if (!authInfo) {
    return null;
  }

  return <>{children}</>;
}
