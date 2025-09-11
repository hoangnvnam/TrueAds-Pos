import { useComponentStyles } from "~/hooks/useComponentStyles";

export const useSettingSwitchStyles = () => {
  return useComponentStyles((theme) => ({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,    
      backgroundColor: theme.colors.background,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 16,
      color: theme.colors.text,
    },
    switch: {
      false: theme.colors.switch.false,
    },
   
  }));
};