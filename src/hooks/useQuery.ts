
import { useQueryClient } from "@tanstack/react-query";
export const getQueryData = (queryKey: string) : any => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData([queryKey]);
};
