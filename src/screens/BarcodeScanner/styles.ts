import { StyleSheet } from 'react-native';
import { useComponentStyles } from '~/hooks/useComponentStyles';
import { useTheme } from '~/hooks/useTheme';

export const useBarcodeScannerStyles = () =>
  useComponentStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    camera: {
      flex: 1,
    },
    text: {
      color: theme.colors.text,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 20,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanArea: {
      width: 250,
      height: 250,
      borderWidth: 2,
      borderColor: '#FFF',
      backgroundColor: 'transparent',
    },
    closeButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanAgainButton: {
      position: 'absolute',
      bottom: 50,
      alignSelf: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 8,
    },
    scanAgainText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 10,
    },
    tabContainer: {
      flexDirection: 'row',
      flex: 1,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 15,
      marginHorizontal: 5,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
      alignItems: 'center',
    },
    activeTabButton: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#000000',
    },
    activeTabText: {
      color: '#ffffff',
    },
    cameraContainer: {
      flex: 1,
      margin: 20,
      borderRadius: 10,
      overflow: 'hidden',
    },
    cameraPlaceholder: {
      flex: 1,
      backgroundColor: '#000000',
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      color: '#CCCCCC',
      marginTop: 10,
      fontSize: 16,
    },
    controls: {
      padding: 20,
      alignItems: 'center',
    },
    toggleButton: {
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 25,
      marginBottom: 10,
    },
    toggleButtonOn: {
      backgroundColor: '#FF6B6B',
    },
    toggleButtonOff: {
      backgroundColor: '#4ECDC4',
    },
    toggleButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    scanSuccessText: {
      color: '#4ECDC4',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 10,
    },
    infoText: {
      color: '#CCCCCC',
      fontSize: 12,
      textAlign: 'center',
      marginTop: 5,
    },
  }));
