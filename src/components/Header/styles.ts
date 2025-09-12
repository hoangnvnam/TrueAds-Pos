import { useComponentStyles } from '~/hooks/useComponentStyles';

export const useHeaderStyles = () => {
  return useComponentStyles((theme) => ({
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    headerTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: 'bold',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    headerRightButton: {
      padding: 5,
    },
    headerRightIcon: {
      color: theme.colors.text,
    },
  }));
};
