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

export const logout = () => {
  deleteCookie(ACCESS_TOKEN_COOKIE);
  deleteCookie(TOKEN_TYPE_COOKIE);
  localStorage.removeItem('user_role');
};

export const getAuthErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const errObj = error as { response?: { data?: { detail?: unknown } }; message?: unknown };
    const detail = errObj.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) => {
          if (typeof d === 'object' && d !== null && 'msg' in d) {
            return (d as { msg?: unknown }).msg as string;
          }
          return JSON.stringify(d);
        })
        .join(', ');
    }
    if (typeof errObj.message === 'string') return errObj.message;
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
};