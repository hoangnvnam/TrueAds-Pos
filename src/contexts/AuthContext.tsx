import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import * as Device from 'expo-device';
import * as WebBrowser from 'expo-web-browser';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useContext, useLayoutEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { axiosParent } from '~/configs/axios';
import { useLoading } from '~/contexts/LoadingContext';
import { useStorage } from '~/hooks/useStorage';
import { toastError } from '~/hooks/useToast';

interface AuthContextType {
  authInfo: any;
  authChild: any;
  login: (authInfo: any) => Promise<void>;
  loginGoogle: (credentials: any) => Promise<void>;
  loginFacebook: (credentials: any) => Promise<void>;
  loginApple: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  setAuthChild: (authChild: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [authChild, setAuthChild] = useState<any>(null);
  const authStorage = useStorage<any>({
    key: 'authParent',
    defaultValue: {},
  });
  const tokenStorage = useStorage<any>({
    key: 'tokenParent',
    defaultValue: {},
  });
  const authChildStorage = useStorage<any>({
    key: 'authChild',
    defaultValue: {},
  });
  const { showLoading, hideLoading } = useLoading();
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    const authState = await authStorage.getValue();
    if (Object.keys(authState).length > 0) {
      setAuthInfo(authState);
      const authChild = await authChildStorage.getValue();
      if (Object.keys(authChild).length > 0) {
        setAuthChild(authChild);
      } else {
        setAuthChild(null);
      }
    } else {
      setAuthInfo(null);
      setAuthChild(null);
    }
  };

  const handleAccountNotFound = ({
    name,
    email,
    social,
    fbId,
  }: {
    name: string;
    email: string;
    social: string;
    fbId?: string;
  }) => {
    let url = 'https://trueads.ai/register';
    if (social === 'facebook') {
      url += `?profile=${encodeURIComponent(`${name}&${email}&${fbId}&facebook`)}&app=trueadspos`;
    } else if (email && name) {
      url += `?profile=${encodeURIComponent(`${email || ''}&${name || ''}&${social || ''}`)}&app=trueadspos`;
    }

    Alert.alert(
      'Đăng ký tài khoản',
      `Tài khoản ${social === 'apple' ? `${name ? name + '- ' : ''}${email}` : ``} không tồn tại, bạn có muốn đăng ký?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có',
          onPress: async () => {
            try {
              await WebBrowser.openBrowserAsync(url);
            } catch (error) {
              console.error('Error opening browser:', error);
              // Fallback to Linking if WebBrowser fails
              Linking.openURL(url);
            }
          },
        },
      ],
    );
  };

  const login = async (credentials: any) => {
    try {
      credentials.device = `${Device.manufacturer}: ${Device.modelName}`;
      showLoading();
      const { data } = await axiosParent.post('/login', credentials);
      const token = { token: data.token, expires_at: data.expires_at };
      await tokenStorage.setValue(token);
      await authStorage.setValue(data.user);
      setAuthInfo(data.user);
    } catch (error: any) {
      toastError(error.response?.data.message || 'Có lỗi xảy ra vui lòng thử lại sau', error.response?.data.subMessage);
    } finally {
      hideLoading();
    }
  };

  const logout = async () => {
    try {
      showLoading();
      try {
        await axiosParent.post('/logout', {
          expoToken: await AsyncStorage.getItem('expoPushToken'),
        });
      } catch (error) {
        console.log('error logout', error);
      }
      try {
        AsyncStorage.multiRemove([
          'storeDomain',
          'fbAuthResponse',
          'zaloAuthResponse',
          'authChild',
          'expoPushToken',
          'authParent',
          'tokenParent',
          'assignedConversations',
          'storeSelected',
        ]);
      } catch (error) {
        console.log('error logout delete', error);
      }
      queryClient.clear();
    } catch (error: any) {
      console.log(error);
      throw error;
    } finally {
      setAuthInfo(null);
      setAuthChild(null);
      hideLoading();
    }
  };
  const loginGoogle = async (credentials: any) => {
    try {
      credentials.device = `${Device.manufacturer}: ${Device.modelName}`;
      showLoading();
      const { data } = await axiosParent.post('/login-google', credentials);
      const token = { token: data.token, expires_at: data.expires_at };
      await tokenStorage.setValue(token);
      await authStorage.setValue(data.user);
      setAuthInfo(data.user);
    } catch (error: any) {
      if (error.response?.data?.code === 'account_not_found') {
        handleAccountNotFound({
          name: credentials.name,
          email: credentials.email,
          social: 'gmail',
        });
      } else {
        toastError(
          error.response?.data?.message || 'Có lỗi xảy ra vui lòng thử lại sau!',
          error.response?.data?.subMessage,
        );
      }
    } finally {
      hideLoading();
    }
  };
  const loginFacebook = async (credentials: any) => {
    try {
      credentials.device = `${Device.manufacturer}: ${Device.modelName}`;
      showLoading();
      const { data } = await axiosParent.post('/login-facebook', credentials);
      const token = { token: data.token, expires_at: data.expires_at };
      await tokenStorage.setValue(token);
      await authStorage.setValue(data.user);
      setAuthInfo(data.user);
    } catch (error: any) {
      if (error.response?.data?.code === 'account_not_found') {
        handleAccountNotFound({
          name: credentials.data.fullName,
          email: credentials.data.email,
          social: 'facebook',
          fbId: credentials.data.userID,
        });
      } else {
        toastError(
          error.response?.data.message || 'Có lỗi xảy ra vui lòng thử lại sau',
          error.response?.data.subMessage,
        );
      }
    } finally {
      hideLoading();
    }
  };
  const loginApple = async (credentials: any) => {
    try {
      credentials.device = `${Device.manufacturer}: ${Device.modelName}`;
      const { data } = credentials;

      if (!data.email) {
        const decodedToken = jwtDecode(data.identityToken) as any;
        credentials.data.email = decodedToken.email;
      }
      if (data.fullName.givenName && data.fullName.familyName) {
        await AsyncStorage.setItem(`appleName-${data.email}`, `${data.fullName.givenName} ${data.fullName.familyName}`);
      }
      const name = await AsyncStorage.getItem(`appleName-${data.email}`);
      showLoading();
      await axiosParent.post('/apple-save-account', {
        appleId: data.user,
        email: credentials.data.email,
        givenName: data.fullName.givenName || name?.split(' ')[0] || '',
        familyName: data.fullName.familyName || name?.split(' ')[1] || '',
        nickname: data.fullName.nickname,
        middleName: data.fullName.middleName,
        namePrefix: data.fullName.namePrefix,
        nameSuffix: data.fullName.nameSuffix,
      });
      const { data: dataLogin } = await axiosParent.post('/login-apple', credentials);
      const token = { token: dataLogin.token, expires_at: dataLogin.expires_at };
      await tokenStorage.setValue(token);
      await authStorage.setValue(dataLogin.user);
      setAuthInfo(dataLogin.user);
    } catch (error: any) {
      if (error.response?.data?.code === 'account_not_found') {
        const data = error.response?.data?.data?.data;
        handleAccountNotFound({
          name: `${data?.family_name || ''} ${data?.given_name || ''}`.trim(),
          email: data.email,
          social: 'apple',
        });
      } else {
        toastError(
          error.response?.data.message || 'Có lỗi xảy ra vui lòng thử lại sau!',
          error.response?.data.subMessage,
        );
      }
    } finally {
      hideLoading();
    }
  };
  return (
    <AuthContext.Provider
      value={{
        authInfo,
        authChild,
        login,
        loginGoogle,
        loginFacebook,
        loginApple,
        logout,
        setAuthChild,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
