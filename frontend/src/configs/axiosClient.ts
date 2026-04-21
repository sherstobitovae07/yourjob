import type {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import axios from 'axios';
import { ACCESS_TOKEN_COOKIE, TOKEN_TYPE_COOKIE } from '../constants/auth';
import { deleteCookie, getCookie } from '../utils/cookies';
const createAxiosClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: '/api/v1',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  client.interceptors.request.use(
    (config) => {
      const token = getCookie(ACCESS_TOKEN_COOKIE);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        const requestUrl = error.config?.url || '';
        const isAuthRequest =
          requestUrl.includes('/auth/login') ||
          requestUrl.includes('/auth/register/');
        if (!isAuthRequest) {
          if (typeof window !== 'undefined') {
            deleteCookie(ACCESS_TOKEN_COOKIE);
            deleteCookie(TOKEN_TYPE_COOKIE);
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/auth')) {
              window.location.href = '/auth';
            }
          }
        }
      }
      return Promise.reject(error);
    }
  );
  return client;
};
export const apiClient = createAxiosClient();
export type { AxiosRequestConfig, AxiosResponse };
