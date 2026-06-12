import type {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import axios from 'axios';
import { ACCESS_TOKEN_COOKIE, TOKEN_TYPE_COOKIE } from '../constants/auth';
import { deleteCookie, getCookie } from '../utils/cookies';
const createAxiosClient = (): AxiosInstance => {
  // eslint-disable-next-line no-console
  console.log(`[AXIOS] Creating client with NEXT_PUBLIC_API_BASE="${process.env.NEXT_PUBLIC_API_BASE}"`);
  
  const client = axios.create({
    // Use relative `/api` by default so Next.js rewrites() proxies requests to backend
    baseURL: process.env.NEXT_PUBLIC_API_BASE || '/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // eslint-disable-next-line no-console
  console.log(`[AXIOS] Final baseURL: "${client.defaults.baseURL}"`);

  client.interceptors.request.use(
    (config) => {
      // eslint-disable-next-line no-console
      console.log(`[AXIOS] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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
      // eslint-disable-next-line no-console
      console.log(`[AXIOS] Response ${response.status} for ${response.config.url}`);
      return response;
    },
    (error) => {
      // eslint-disable-next-line no-console
      console.error(`[AXIOS ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error(`[AXIOS ERROR] Status: ${error.response?.status}, Message: ${error.message}`);
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
