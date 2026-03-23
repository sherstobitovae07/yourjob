/** Соответствует `UserRole` на бэкенде (`app/models/enums.py`). */
export type UserRole = "STUDENT" | "EMPLOYER" | "ADMIN";

/** Ответ `POST /auth/login` — `TokenResponse` в `app/schemas/auth.py`. */
export type TokenResponse = {
  access_token: string;
  token_type: string;
};

/** Ответ регистрации и `GET /auth/me` — `UserResponse` в `app/schemas/user.py`. */
export type UserResponse = {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  created_at: string | null;
};

/** Тело `LoginRequest` в `app/schemas/auth.py`. */
export type LoginRequest = {
  email: string;
  password: string;
};

/** Тело `StudentRegisterRequest` в `app/schemas/auth.py`. */
export type StudentRegisterRequest = {
  email: string;
  password: string;
  first_name?: string | null;
  last_name?: string | null;
  university?: string | null;
  faculty?: string | null;
  specialty?: string | null;
  resume_path?: string | null;
};

/** Тело `EmployerRegisterRequest` в `app/schemas/auth.py`. */
export type EmployerRegisterRequest = {
  email: string;
  password: string;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  description?: string | null;
  website?: string | null;
};
