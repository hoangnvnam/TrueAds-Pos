import { useComponentStyles } from '~/hooks/useComponentStyles';

export const useInputStyles = () => {
  return useComponentStyles((theme) => ({
    container: {
      flex: 1,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: theme.colors.text,
      fontWeight: '500',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
      backgroundColor: theme.colors.background,
    },

    input: {
      flex: 1,
      height: 40,
      color: theme.colors.text,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
      marginTop: 4,
    },
  }));
};
