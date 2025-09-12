import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Profile, Settings } from 'react-native-fbsdk-next';
import * as WebBrowser from 'expo-web-browser';

import {
  GestureResponderEvent,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Footer } from '~/components/Footer';
import { useAuth } from '~/contexts/AuthContext';
import { useSettings } from '~/contexts/SettingsContext';
import { useTheme } from '~/hooks/useTheme';
import { toastError } from '~/hooks/useToast';
import { globalStyles } from '~/styles/globalStyles';
import { isMobile } from '~/utils/devices';
import useLoginStyles from './styles';

GoogleSignin.configure({
  webClientId: '787039452042-kvh5iahaklrdmhj4udf9mi1ab5ujnlc7.apps.googleusercontent.com',
  iosClientId: '787039452042-3bqo523hgcr4u4vfs3r1mi1a9qqqf691.apps.googleusercontent.com',
});

export function Login() {
  const theme = useTheme();
  const { params } = useRoute() as any;
  const { isDarkMode } = useSettings();
  const { styles } = useLoginStyles();
  const { login, loginGoogle, loginFacebook, loginApple } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusPermission, setStatusPermission] = useState('');

  useEffect(() => {
    const requestTracking = async () => {
      const { status } = await requestTrackingPermissionsAsync();
      setStatusPermission(status);
      Settings.initializeSDK();

      if (status === 'granted') {
        await Settings.setAdvertiserTrackingEnabled(true);
      }
    };

    requestTracking();
  }, []);

  useEffect(() => {
    try {
      if (params && (params as any).registerData) {
        const registerData = params?.registerData;
        setUsername(registerData.split('&')[0] || '');
        setPassword(registerData.split('&')[1] || '');
        setTimeout(() => {
          handleLogin();
          WebBrowser.dismissBrowser();
        }, 500);
      }
    } catch (error) {}
  }, [params]);

  useFocusEffect(
    React.useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      return () => ScreenOrientation.unlockAsync();
    }, []),
  );

  const handleLogin = async () => {
    if (!username || !password) {
      toastError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    await login({
      username,
      password,
    });
  };

  const handleTogglePassword = (event: GestureResponderEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setShowPassword(!showPassword);
  };
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.type === 'cancelled') {
        return;
      }
      await loginGoogle({ data: { id_token: userInfo.data?.idToken } });
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      } else if (error.response?.data?.message) {
      } else {
        toastError('Có lỗi xảy ra vui lòng thử lại sau');
      }
    }
  };
  const handleFacebookLogin = async () => {
    try {
      if (Platform.OS === 'ios' && statusPermission !== 'granted') {
        return toastError('Vui lòng cấp quyền theo dõi để đăng nhập bằng Facebook');
      }
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) {
        return;
      }
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw new Error('Failed to get access token');
      }
      const profile = await Profile.getCurrentProfile();
      let credetial = {
        fullName: profile?.name,
        email: profile?.email,
        userID: data.userID,
      };

      await loginFacebook({ data: credetial });
    } catch (error: any) {
      if (error.response?.data?.message) {
        toastError(error.response?.data?.message);
      } else {
        toastError('Có lỗi xảy ra vui lòng thử lại sau');
      }
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });
      await loginApple({ data: credential });
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
      } else {
        if (e.response?.data?.message) {
        } else {
          toastError('Có lỗi xảy ra vui lòng thử lại sau');
        }
      }
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/logotext.png')}
          style={[
            styles.logo,
            isMobile() && { width: 289 },
            isDarkMode && {
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0.2, height: 0.2 },
              shadowOpacity: 0.6,
              shadowRadius: 2.5,
            },
          ]}
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>
            Chào mừng bạn đến với <Text style={{ color: theme.colors.primary }}>True</Text>
            <Text
              style={{
                color: '#000000',
                ...(isDarkMode && {
                  textShadowColor: 'white',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 2,
                }),
              }}
            >
              Ads
            </Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Tên đăng nhập"
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={handleTogglePassword}>
              <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <TouchableOpacity
              style={[styles.loginButton, globalStyles.roundedFull, globalStyles.dropShadow]}
              onPress={handleLogin}
            >
              <Text style={[styles.loginButtonText, theme.fonts.bold]}>Đăng nhập</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity style={[styles.fingerprintContainer, globalStyles.dropShadow]}>
              <Image source={require('~/assets/icons/fingerprint.png')} />
            </TouchableOpacity> */}
          </View>
          <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => {}}>
            {/* <Text style={styles.forgotPassword}>Quên mật khẩu ?</Text>
            <View style={styles.lineDown}></View> */}
          </TouchableOpacity>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              onPress={handleGoogleLogin}
              style={[styles.socialButton, styles.googleButton, globalStyles.dropShadow]}
            >
              <Image source={require('~/assets/icons/google-icon.png')} />
              <Text style={[styles.socialButtonText, theme.fonts.bold]}>Google</Text>
              <Image source={require('~/assets/icons/google-icon.png')} style={{ opacity: 0 }} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleFacebookLogin}
              style={[styles.socialButton, styles.facebookButton, globalStyles.dropShadow]}
            >
              <Image source={require('~/assets/icons/facebook-icon.png')} />
              <Text style={[styles.socialButtonText, styles.facebookButtonText, theme.fonts.bold]}>Facebook</Text>
              <Image source={require('~/assets/icons/facebook-icon.png')} style={{ opacity: 0 }} />
            </TouchableOpacity>
          </View>
          {Platform.OS === 'ios' && (
            <View style={[styles.socialContainer, { marginTop: 10 }]}>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={5}
                style={[styles.socialButton, styles.appleButton]}
                onPress={handleAppleLogin}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <Footer />
    </KeyboardAvoidingView>
  );
}
