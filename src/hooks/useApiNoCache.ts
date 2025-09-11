import { axiosChild } from '../configs/axios';

export function useGetNoCache<T>(url: string) {
  const getData = async ({ params, signal, action }: { params?: any; signal?: AbortSignal; action?: string }) => {
    try {
      const axiosInstance = await axiosChild({ action: action || null });
      const { data } = await axiosInstance.get<T>(url, { params, signal });
      return data as any;
    } catch (error) {
      throw error;
    }
  };

  return { getData };
}

export function usePostNoCache<T, V>(url: string) {
  const postData = async (variables: V) => {
    try {
      const axiosInstance = await axiosChild({ action: null });
      const { data } = await axiosInstance.post<T>(url, variables);
      return data as any;
    } catch (error) {
      throw error;
    }
  };

  return { postData };
}

export function usePutNoCache<T, V>(url: string) {
  const putData = async (variables: V) => {
    try {
      const axiosInstance = await axiosChild({ action: null });
      const { data } = await axiosInstance.put<T>(url, variables);
      return data;
    } catch (error) {
      throw error;
    }
  };

  return { putData };
}

export function useDeleteNoCache<T>(url: string) {
  const deleteData = async () => {
    try {
      const axiosInstance = await axiosChild({ action: null });
      const { data } = await axiosInstance.delete<T>(url);
      return data;
    } catch (error) {
      throw error;
    }
  };

  return { deleteData };
}
