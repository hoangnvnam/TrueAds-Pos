import { useComponentStyles } from "../../hooks/useComponentStyles";

export const useImageStyles = () => {
  return useComponentStyles((theme) => ({
    container: {
      position: 'relative',
      overflow: 'hidden',
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    errorContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    errorIcon: {
      width: 24,
      height: 24,
      tintColor: theme.colors.text,
      opacity: 0.5,
    },
  }));
}; 