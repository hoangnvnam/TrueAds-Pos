import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSettings } from '~/contexts/SettingsContext';
import { styles } from './styles';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: [string, string];
}

export function GradientBackground({ children, style, colors = ['#EBF4FB', '#FDEDDF'] }: GradientBackgroundProps) {
  const { isDarkMode } = useSettings();
  return (
    <View style={[styles.container, style]}>
      <LinearGradient colors={isDarkMode ? ['#121212', '#1a1a1a'] : colors} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}
