import type {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import axios from 'axios';

import { deleteCookie, getCookie } from '@/utils/cookies';

const TOKEN_KEY = 'access_token';
const TOKEN_TYPE_KEY = 'token_type';

/**
 * Создает экземпляр axios клиента для работы с API
 */
const createAxiosClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: '/api/v1',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Интерсептор запросов - добавляет токен авторизации
  client.interceptors.request.use(
    (config) => {
      const token = getCookie(TOKEN_KEY);
      const tokenType = getCookie(TOKEN_TYPE_KEY) || 'bearer';

      if (token) {
        config.headers.Authorization = `${tokenType} ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Интерсептор ответов - обрабатывает ошибки авторизации
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // Проверяем, не является ли это запросом на авторизацию
        // Если это запрос на /auth/token, не делаем редирект - ошибка должна быть обработана в компоненте
        const requestUrl = error.config?.url || '';
        const isAuthRequest = requestUrl.includes('/auth/token');

        if (!isAuthRequest) {
          // Токен недействителен, очищаем куки
          if (typeof window !== 'undefined') {
            deleteCookie(TOKEN_KEY);
            deleteCookie(TOKEN_TYPE_KEY);

            // Редирект на страницу авторизации только если мы не на странице авторизации
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

// Экспортируем готовый клиент
export const apiClient = createAxiosClient();

// Экспортируем типы для удобства
export type { AxiosRequestConfig, AxiosResponse };

