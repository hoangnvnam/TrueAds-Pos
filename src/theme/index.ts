import { fonts } from './fonts';

export const lightTheme = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    border: '#D9D9D9',
    notification: '#FF3B30',
    input: '#F5F5F5',
    placeholder: '#666666',
    icon: '#666666',
    tabBar: '#FDEDDF',
    switch: {
      false: '#D9D9D9',
    },
    messageCustomer: '#ffffff',
    messageOwn: '#4c9aff',
    sideBar: '#FFFFFF',
    close: '#DDDDDD',
  },
  fonts: {
    regular: { fontFamily: fonts.regular, fontWeight: '400' as const },
    medium: { fontFamily: fonts.medium, fontWeight: '500' as const },
    bold: { fontFamily: fonts.bold, fontWeight: '700' as const },
    heavy: { fontFamily: fonts.heavy, fontWeight: '900' as const },
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    background: '#000000',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#2C2C2C',
    notification: '#FF453A',
    input: '#F5F5F5',
    placeholder: '#808080',
    icon: '#DAE4FF',
    tabBar: '#1a1a1a',
    switch: {
      false: '#D9D9D9',
    },
    messageCustomer: '#ffffff',
    messageOwn: '#4c9aff',
    sideBar: '#1a1a1a',
    close: '#666666',
  },
  fonts: {
    regular: { fontFamily: fonts.regular, fontWeight: '400' as const },
    medium: { fontFamily: fonts.medium, fontWeight: '500' as const },
    bold: { fontFamily: fonts.bold, fontWeight: '700' as const },
    heavy: { fontFamily: fonts.heavy, fontWeight: '900' as const },
  },
};
export const global = {
  colors: {
    success: '#4CAF50',
    error: '#ff3b30',
    warning: '#FF9800',
    info: '#2196F3',
    primary: '#F1673A',
    secondary: '#0866FF',
    secondaryLight: '#DAE4FF',
    black: '#000000',
    white: '#FFFFFF',
    title: '#757575',
  },
};

export const theme = {
  ...lightTheme,
  ...global,
  colors: {
    ...lightTheme.colors,
    ...global.colors,
  },
};
