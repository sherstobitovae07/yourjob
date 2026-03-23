import axios from "axios";

import { apiClient } from "@/configs/axiosClient";
import { ACCESS_TOKEN_COOKIE, TOKEN_TYPE_COOKIE } from "@/constants/auth";
import type {
  EmployerRegisterRequest,
  LoginRequest,
  StudentRegisterRequest,
  TokenResponse,
  UserResponse,
} from "@/types/auth";
import { setCookie } from "@/utils/cookies";

const TOKEN_MAX_AGE_DAYS = 7;

function persistSession(data: TokenResponse): void {
  setCookie(ACCESS_TOKEN_COOKIE, data.access_token, TOKEN_MAX_AGE_DAYS);
  setCookie(TOKEN_TYPE_COOKIE, data.token_type, TOKEN_MAX_AGE_DAYS);
}

export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(
    "/auth/login",
    credentials
  );
  persistSession(data);
  return data;
}

export async function fetchCurrentUser(): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>("/auth/me");
  return data;
}

export async function registerStudent(
  payload: StudentRegisterRequest
): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>(
    "/auth/register/student",
    payload
  );
  return data;
}

export async function registerEmployer(
  payload: EmployerRegisterRequest
): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>(
    "/auth/register/employer",
    payload
  );
  return data;
}

export function getAuthErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Не удалось выполнить запрос";
  }

  const raw = error.response?.data;
  if (raw && typeof raw === "object" && "detail" in raw) {
    const detail = (raw as { detail: unknown }).detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      if (typeof first?.msg === "string") {
        return first.msg;
      }
    }
  }

  return error.message || "Запрос не выполнен";
}
