import { useComponentStyles } from '~/hooks/useComponentStyles';

const useDevicesStyles = () => {
  return useComponentStyles((theme) => ({
    container: {
      flex: 1,
      padding: 16,
    },
    header: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme.colors.text,
    },
    sessionContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: 8,
      marginBottom: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    currentSession: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    sessionInfo: {
      flex: 1,
    },
    deviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    deviceText: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
      color: theme.colors.text,
    },
    currentBadge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginLeft: 8,
    },
    currentBadgeText: {
      color: theme.colors.white,
      fontSize: 12,
      fontWeight: '500',
    },
    ipText: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.7,
      marginBottom: 4,
    },
    timeText: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.5,
      marginBottom: 12,
    },
    logoutButton: {
      backgroundColor: theme.colors.error,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    logoutButtonText: {
      color: theme.colors.white,
      fontWeight: '600',
    },
    footerText: {
      textAlign: 'center',
      marginTop: 16,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    sessionActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
    },
    actionButton: {
      padding: 8,
    },
  }));
};

export default useDevicesStyles;
