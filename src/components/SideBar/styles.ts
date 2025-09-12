import { useComponentStyles } from '../../hooks/useComponentStyles';

export const useSideBarStyles = () => {
  return useComponentStyles((theme) => ({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'column',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      padding: 10,
      gap: 5,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      marginRight: 10,
    },
    headerInfo: {
      flexDirection: 'column',
    },
    contactBox: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      marginRight: 10,
    },
    menuContainer: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    email: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.8,
      marginBottom: 2,
    },
    id: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.6,
    },
    menuSection: {
      paddingVertical: 2,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 16,
    },
    menuIcon: {
      width: 24,
      height: 24,
      marginRight: 12,
    },
    menuContent: {
      flex: 1,
    },
    menuTitle: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 2,
    },
    menuSubtitle: {
      fontSize: 12,
      color: theme.colors.text,
      opacity: 0.6,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 8,
    },
    productSection: {
      paddingVertical: 8,
    },
    headerAvatar: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  }));
};
