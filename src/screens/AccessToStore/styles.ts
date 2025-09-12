import { useComponentStyles } from '~/hooks/useComponentStyles';
import { useSettings } from '~/contexts/SettingsContext';
import { theme } from '~/theme';

export const useAccessToStoreStyles = () => {
  const { isDarkMode } = useSettings();
  return useComponentStyles((theme) => ({
    container: {
      flex: 1,
      width: '100%',
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingBottom: 20,
      marginVertical: 20,
    },

    fixedLogo: {
      width: 50,
      height: 50,
    },
    text: {
      width: 120,
      objectFit: 'contain',
      ...(isDarkMode && {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0.2, height: 0.2 },
        shadowOpacity: 1,
        shadowRadius: 1,
        elevation: 5,
      }),
    },
    content: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 30,
    },
    storeContainer: {
      width: '100%',
      marginTop: 20,
    },
    storeTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 10,
    },
    storeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 7,
      backgroundColor: theme.colors.card,
      padding: 10,
      borderRadius: 10,
      height: 65,
    },
    storeItemImage: {
      width: 40,
      height: 40,
    },
    storeItemContent: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: 10,
      gap: 5,
    },
    storeItemName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    storeItemHost: {
      fontSize: 12,
      fontWeight: '400',
      color: theme.colors.text,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      padding: 20,
      borderRadius: 10,
      width: '80%',
      alignItems: 'center',
    },
    modalText: {
      fontSize: 16,
      color: theme.colors.text,
      marginRight: 10,
    },
    copyButton: {
      padding: 5,
    },
    closeButton: {
      backgroundColor: theme.colors.primary,
      padding: 10,
      borderRadius: 5,
      width: '50%',
      alignItems: 'center',
    },
    closeButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  }));
};
