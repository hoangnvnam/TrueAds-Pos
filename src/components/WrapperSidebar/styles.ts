import { StyleSheet } from 'react-native';
import { useComponentStyles } from '~/hooks/useComponentStyles';

export const useWrapperSidebarStyles = () => {
  return useComponentStyles((theme) => ({
    container: {
      flex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      backgroundColor: theme.colors.sideBar,
      zIndex: 1000,
      elevation: 5,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      zIndex: 999,
    },
  }));
};
