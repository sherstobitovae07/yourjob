// Утилиты для работы с куками

import { ACCESS_TOKEN_COOKIE } from '@/constants/auth';

export const setCookie = (name: string, value: string, days = 7, path = '/') => {
    if (typeof document === 'undefined') return;
  
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=${path}`;
  };
  
  export const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
  
    const nameEQ = encodeURIComponent(name) + '=';
    const ca = document.cookie.split(';');
  
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  
    return null;
  };
  
  export const deleteCookie = (name: string, path = '/') => {
    if (typeof document === 'undefined') return;
  
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
  };
  
  // Для обратной совместимости
  export const removeCookie = deleteCookie;
  
  export const AUTH_COOKIE_NAME = ACCESS_TOKEN_COOKIE;
  
  