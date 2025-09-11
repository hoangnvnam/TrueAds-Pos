import { useComponentStyles } from "../../hooks/useComponentStyles";

export const useIconStyles = () => {
  return useComponentStyles((theme) => ({
    icon: {
      alignSelf: 'center',
    },
  }));
}; 