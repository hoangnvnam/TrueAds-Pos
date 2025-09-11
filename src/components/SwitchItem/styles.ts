import { useComponentStyles } from "~/hooks/useComponentStyles";

export const useSwitchItemStyles = () => {
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
      leftContent: {
        flexDirection: "row",
        alignItems: "center",
      },
      iconContainer: {
        marginRight: 12,
      },
      title: {
        fontSize: 16,
        color: theme.colors.text,
      },
      rightContent: {
        flexDirection: "row",
        alignItems: "center",
      },
      rightText: {
      fontSize: 16,
      color: theme.colors.text,
      marginRight: 8,
    },
  }));
};