import { StyleSheet, Dimensions, Platform } from 'react-native';

const { height, width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    objectFit: 'contain',
    position: 'absolute',
  },
  fixedLogo: {
    top: height * 0.1055,
    left: width * 0.2725,
    height: 50,
    width: 50,
    objectFit: 'contain',
  },
  text: {
    height: 30,
    objectFit: 'contain',
    position: 'absolute',
    top: Platform.OS === 'ios' ? height * 0.117 : height * 0.129,
    left: width * -0.02,
  },
  logoText: {
    height: 40,
    objectFit: 'contain',
    position: 'absolute',
    top: -100,
  },
});
