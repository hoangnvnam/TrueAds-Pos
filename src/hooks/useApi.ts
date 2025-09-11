import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { axiosChild } from '../configs/axios';

export const useFetchData = ({
  queryKey,
  url,
  params,
  options,
  action = null,
}: {
  queryKey: string[];
  url: string;
  params?: any;
  options?: Omit<UseQueryOptions<any, Error, any, string[]>, 'queryKey' | 'queryFn'>;
  action?: string | null;
}): {
  data: any;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  refresh: () => Promise<void>;
  clearCache: () => void;
} => {
  const queryClient = useQueryClient();

  const results = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await (await axiosChild({ action: action })).get(url, { params });
      return data;
    },
    ...options,
  });

  const removeCache = async () => {
    await queryClient.invalidateQueries({ queryKey });
  };

  const clearCache = () => {
    queryClient.removeQueries({ queryKey });
  };

  return {
    ...results,
    refresh: removeCache,
    clearCache,
  };
};

export function usePostData<T, V>({
  url,
  action = null,
  options,
}: {
  url: string;
  action?: string | null;
  options?: Omit<UseMutationOptions<T, Error, V, unknown>, 'mutationFn'>;
}) {
  return useMutation({
    mutationFn: async (variables: V) => {
      const axiosInstance = await axiosChild({ action: action });
      const { data } = await axiosInstance.post<T>(url, variables);
      return data;
    },
    ...options,
  });
}

export function usePutData<T, V>(
  url: string,
  action?: string | null,
  options?: Omit<UseMutationOptions<T, Error, V, unknown>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn: async (variables: V) => {
      const axiosInstance = await axiosChild({ action: action });
      const { data } = await axiosInstance.put<T>(url, variables);
      return data;
    },
    ...options,
  });
}

export function useDeleteData<T>(
  url: string,
  action?: string | null,
  options?: Omit<UseMutationOptions<T, Error, void, unknown>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn: async () => {
      const axiosInstance = await axiosChild({ action: action });
      const { data } = await axiosInstance.delete<T>(url);
      return data;
    },
    ...options,
  });
}
