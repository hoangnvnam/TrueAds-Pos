import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosParent = axios.create({
  baseURL: 'https://trueads.ai/wp-json/mobile/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface AxiosChildProps {
  action?: string | null | undefined;
}

const axiosChild = async ({ action }: AxiosChildProps): Promise<AxiosInstance> => {
  const storeDomain = await AsyncStorage.getItem('storeDomain');
  const authChild = JSON.parse((await AsyncStorage.getItem('authChild')) || '{}');

  if (!storeDomain) {
    throw new Error('Store domain is not set');
  }

  const instance = axios.create({
    baseURL: `${storeDomain}/wp-json/mobile/v1`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': authChild?.ID || '',
      'X-Role-User': authChild?.roles || '',
      Authorization: '',
      'X-Action': action || '',
    },
  });

  // Add request interceptor
  instance.interceptors.request.use(
    async (config) => {
      try {
        if (authChild) {
          config.headers.Authorization = `Bearer ${authChild?.token}`;
          config.headers['X-User-ID'] = authChild?.ID || '';
          config.headers['X-Role-User'] = authChild?.roles || '';
          config.headers['X-Action'] = action || '';
        }
        return config;
      } catch (error) {
        return config;
      }
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Add response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        AsyncStorage.removeItem('authChild');
      }
      return Promise.reject(error.response.data);
    },
  );

  return instance;
};

axiosParent.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('tokenParent');
      const user = await AsyncStorage.getItem('authParent');
      if (token) {
        const { token: tokenParent } = JSON.parse(token || '{}');
        const { id: userParent } = JSON.parse(user || '{}');
        if (tokenParent) {
          config.headers.Authorization = `Bearer ${tokenParent}`;
          config.headers['X-User-ID'] = userParent || '';
        }
      }
      return config;
    } catch (error) {
      console.log(error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosParent.interceptors.response.use(
  async (response) => {
    if (response.data.tokenInfo) {
      // delete response.data.tokenInfo;
      await AsyncStorage.setItem('tokenParent', JSON.stringify(response.data.tokenInfo));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('authParent');
      AsyncStorage.removeItem('tokenParent');
    }
    return Promise.reject(error);
  },
);

export { axiosParent, axiosChild };
