// Сервис для авторизации, регистрации и работы с текущим пользователем

import { apiClient } from '@/configs/axiosClient';
import { setCookie, deleteCookie } from '../utils/cookies';
import { ACCESS_TOKEN_COOKIE, TOKEN_TYPE_COOKIE } from '@/constants/auth';
import type {
  LoginRequest,
  TokenResponse,
  StudentRegisterRequest,
  EmployerRegisterRequest,
  UserResponse,
} from '../types/auth';

export const login = async (data: LoginRequest): Promise<UserResponse | null> => {
  const response = await apiClient.post<TokenResponse>('/auth/login', data);
  const { access_token, token_type = 'bearer' } = response.data;

  setCookie(ACCESS_TOKEN_COOKIE, access_token, 7);
  setCookie(TOKEN_TYPE_COOKIE, token_type, 7);

  try {
    const user = await getCurrentUser();
    if (user?.role) {
      localStorage.setItem('user_role', user.role);
    }
    return user;
  } catch {
    return null;
  }
};

export const registerStudent = async (data: StudentRegisterRequest): Promise<UserResponse> => {
  const response = await apiClient.post<UserResponse>('/auth/register/student', data);
  return response.data;
};

export const registerEmployer = async (data: EmployerRegisterRequest): Promise<UserResponse> => {
  const response = await apiClient.post<UserResponse>('/auth/register/employer', data);
  return response.data;
};

export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await apiClient.get<UserResponse>('/auth/me');
  return response.data;
};

export const verifyEmail = async (email: string, code: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/auth/verify-email', { email, code });
  return response.data;
};

export const logout = () => {
  deleteCookie(ACCESS_TOKEN_COOKIE);
  deleteCookie(TOKEN_TYPE_COOKIE);
  localStorage.removeItem('user_role');
};

export const getAuthErrorMessage = (error: unknown): string => {
  const translate = (msg: string): string => {
    if (!msg) return '';
    const m = String(msg);
    if (/ensure this value has at least (\d+) characters/i.test(m) || /String should have at least (\d+) characters/i.test(m)) {
      const n = m.match(/(\d+)/)?.[0] ?? '';
      return `Строка должна содержать не менее ${n} символов`;
    }
    if (/ensure this value has at most (\d+) characters/i.test(m)) {
      const n = m.match(/(\d+)/)?.[0] ?? '';
      return `Строка должна содержать не более ${n} символов`;
    }
    if (/field required/i.test(m) || /value is required/i.test(m)) return 'Поле обязательно для заполнения';
    if (/value is not a valid email/i.test(m) || /invalid email/i.test(m)) return 'Неверный формат email';
    if (/type error/i.test(m)) return 'Ошибка типа значения';
    if (/Not authenticated/i.test(m) || /Could not validate credentials/i.test(m)) return 'Неавторизован. Войдите в систему';
    if (/Invalid credentials/i.test(m) || /Неверные учетные данные/i.test(m)) return 'Неверные учетные данные';
    if (/detail/i.test(m) && m.toLowerCase().includes('подтвердите')) return m;
    const dict: Record<string, string> = {
      'string does not match regex': 'Значение не соответствует требованиям формата',
      'value is not a valid integer': 'Значение должно быть целым числом',
      'value is not a valid number': 'Значение должно быть числом',
      'Invalid token': 'Неверный токен',
    };
    for (const k of Object.keys(dict)) {
      if (m.toLowerCase().includes(k)) return dict[k];
    }
    return m;
  };

  if (typeof error === 'object' && error !== null) {
    const errObj = error as { response?: { data?: { detail?: unknown } }; message?: unknown };
    const detail = errObj.response?.data?.detail;
    if (typeof detail === 'string') return translate(detail);
    if (Array.isArray(detail)) {
      return detail
        .map((d) => {
          if (typeof d === 'object' && d !== null && 'msg' in d) {
            return translate((d as { msg?: unknown }).msg as string);
          }
          if (typeof d === 'string') return translate(d);
          return JSON.stringify(d);
        })
        .join(', ');
    }
    if (typeof errObj.message === 'string') return translate(errObj.message as string);
  }
  return 'Произошла ошибка. Попробуйте позже.';
};

// grouped export for compatibility
export const authService = {
  login,
  registerStudent,
  registerEmployer,
  getCurrentUser,
  logout,
  getAuthErrorMessage,
  verifyEmail,
};