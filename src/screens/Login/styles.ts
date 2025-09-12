import { Dimensions, StyleSheet } from 'react-native';
import { useComponentStyles } from '~/hooks/useComponentStyles';
import { isMobile } from '~/utils/devices';

const { height, width } = Dimensions.get('window');

export default function useLoginStyles() {
  return useComponentStyles((theme) => ({
    container: {
      flex: 1,
      padding: 20,
    },
    logoContainer: {
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 80,
      marginBottom: isMobile() ? 40 : 60,
    },
    logo: {
      objectFit: 'contain',
    },
    welcomeText: {
      fontSize: 24,
      marginBottom: 8,
      color: theme.colors.text,
    },
    nameText: {
      fontSize: 20,
      color: theme.colors.text,
      marginBottom: 30,
    },
    formContainer: {
      width: '100%',
    },
    input: {
      backgroundColor: theme.colors.card,
      color: theme.colors.text,
      paddingRight: 40,
      borderRadius: 8,
      padding: 15,
      marginBottom: 15,
      fontSize: 16,
      shadowColor: theme.colors.border,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    passwordContainer: {
      position: 'relative',
    },
    eyeIcon: {
      position: 'absolute',
      right: 15,
      top: 15,
    },
    loginButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      padding: 10,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      height: 45,
    },
    loginButtonText: {
      color: 'white',
      fontSize: 18,
    },
    forgotPassword: {
      color: theme.colors.text,
      textAlign: 'center',
    },
    socialContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 15,
    },
    socialButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'white',
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderRadius: 5,
      height: 45,
    },
    googleButton: {
      backgroundColor: 'white',
    },
    facebookButton: {
      backgroundColor: '#1877F2',
    },
    appleButton: {
      height: 45,
    },
    socialButtonText: {
      marginLeft: 8,
      fontSize: 16,
      color: '#333',
      flex: 1,
      textAlign: 'center',
    },
    facebookButtonText: {
      color: 'white',
    },

    fingerprintContainer: {
      backgroundColor: '#fff',
      padding: 5,
      borderRadius: 10,
      marginLeft: 10,
      height: 45,
      width: 45,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loginContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    lineDown: {
      width: '100%',
      height: 1,
      backgroundColor: '#D9D9D9',
    },
    forgotPasswordContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginTop: 20,
      marginBottom: 30,
      gap: 20,
    },
  }));
}
