import AsyncStorage from '@react-native-async-storage/async-storage';

export const getStoreDomain = async () => {
  const storeDomain = await AsyncStorage.getItem('storeDomain');
  return storeDomain;
};
