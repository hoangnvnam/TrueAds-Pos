import Toast from 'react-native-toast-message';

export const toastError = (string: string, sub?: string) => {
  return Toast.show({ text1: string, text2: sub, position: 'top', visibilityTime: 3000, type: 'error' });
};
export const toastSuccess = (string: string, sub?: string) => {
  return Toast.show({ text1: string, text2: sub, position: 'top', visibilityTime: 3000, type: 'success' });
};
export const toastWarning = (string: string, sub?: string) => {
  return Toast.show({ text1: string, text2: sub, position: 'top', visibilityTime: 3000, type: 'warning' });
};
export const toastInfo = (string: string, sub?: string) => {
  return Toast.show({ text1: string, text2: sub, position: 'top', visibilityTime: 3000, type: 'info' });
};
