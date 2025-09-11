import { useSettings } from '~/contexts/SettingsContext';
import { lightTheme, darkTheme, global } from '~/theme';

export const useTheme = () => {
  const { isDarkMode } = useSettings();

  // include global colors into color of both themes
  const theme = isDarkMode ? darkTheme : lightTheme;
  theme.colors = { ...theme.colors, ...global.colors };
  return theme as any;
};
