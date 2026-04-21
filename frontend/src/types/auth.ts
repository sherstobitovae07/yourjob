
export type UserRole = "STUDENT" | "EMPLOYER" | "ADMIN";
export type TokenResponse = {
  access_token: string;
  token_type: string;
};
export type UserResponse = {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  created_at: string | null;
};
export type LoginRequest = {
  email: string;
  password: string;
};
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
export type EmployerRegisterRequest = {
  email: string;
  password: string;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  description?: string | null;
  website?: string | null;
};