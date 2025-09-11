import { useComponentStyles } from '~/hooks/useComponentStyles';

export const useHomeStyles = () => {
  return useComponentStyles((theme) => ({
    container: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 30,
      paddingVertical: 10,
      gap: 10,
      marginTop: 10,
    },
    filterButton: {
      padding: 8,
      borderRadius: 10,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    content: {
      marginTop: 20,
      flex: 1,
    },
    conversationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: 30,
      paddingVertical: 10,
      gap: 15,
      maxHeight: 80,
    },
    conversationItemNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    conversationItemContent: {
      flex: 1,
      gap: 3,
    },
    conversationItemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      justifyContent: 'space-between',
    },
    badgeContainer: {
      backgroundColor: '#FF3B30',
      width: 16,
      height: 16,
      borderRadius: 99,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      fontSize: 10,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    message: {
      maxWidth: 180,
      fontSize: 12,
      color: theme.colors.text,
    },
    conversationItemName: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    conversationItemTimeSeparator: {
      fontSize: 16,
      color: theme.colors.placeholder,
    },
    conversationItemTime: {
      fontSize: 12,
      color: theme.colors.placeholder,
    },
    conversationItemTimeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    tagContainer: {
      maxWidth: '100%',
      flex: 1,
    },
    tagItem: {
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 6,
      marginRight: 6,
      maxWidth: 100,
    },
    tagText: {
      fontSize: 11,
      color: '#000000',
      fontWeight: '500',
    },
    bottomContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      justifyContent: 'space-between',
      marginTop: 1,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    assignedContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    assignedAvatar: {
      width: 22,
      height: 22,
      borderRadius: 11,
      justifyContent: 'center',
      alignItems: 'center',
    },
    assignedInitials: {
      fontSize: 10,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    loaderContainer: {
      paddingVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchContainer: {
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  }));
};
