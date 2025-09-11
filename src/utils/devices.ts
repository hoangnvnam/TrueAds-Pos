import { Dimensions } from 'react-native';

export const isMobile = () => {
  const { width } = Dimensions.get('window');
  return width < 512;
};
