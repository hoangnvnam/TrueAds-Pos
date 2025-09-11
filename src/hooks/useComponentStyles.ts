import { StyleSheet } from "react-native";
import { useTheme } from "./useTheme";

type StyleFunction = (theme: any) => any;

export function useComponentStyles(styleFunction: StyleFunction) {
  const theme = useTheme();
  const styles = styleFunction(theme);
  return {
    styles: StyleSheet.create(styles),
    theme,
  };
}
