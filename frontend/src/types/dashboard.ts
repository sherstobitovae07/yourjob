// src/types/dashboard.ts
import { UserRole } from "./auth";

export interface StudentProfileResponse {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  university: string | null;
  faculty: string | null;
  specialty: string | null;
  resume_path: string | null;
}

export interface EmployerProfileResponse {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  company_name: string | null;
  description: string | null;
  website: string | null;
}

// Алиасы для удобства в компонентах (чтобы не менять много кода)
export type StudentProfileData = StudentProfileResponse;
export type EmployerProfileData = EmployerProfileResponse;

export interface InternshipResponse {
  id: number;
  employer_id: number;
  title: string | null;
  description: string | null;
  city: string | null;
  direction: string | null;
  salary: number | null;
  status: "ACTIVE" | "CLOSED" | "ARCHIVED" | null;
  deadline: string | null;
  created_at: string | null;
}

export interface InternshipPublicResponse {
  id: number;
  title: string | null;
  description: string | null;
  city: string | null;
  direction: string | null;
  salary: number | null;
  status: "ACTIVE" | "CLOSED" | "ARCHIVED" | null;
  deadline: string | null;
  created_at: string | null;
  company_name: string | null;
  applications_count: number;
  image_url?: string | null;
}

export interface StudentApplicationResponse {
  id: number;
  internship_id: number;
  internship_title: string | null;
  company_name: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | null;
  applied_at: string | null;
  image_url?: string | null;
}

export interface ApplicationResponse {
  id: number;
  student_id: number;
  internship_id: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | null;
  applied_at: string | null;
}

export interface InternshipApplicationResponse {
  id: number;
  student_id: number;
  student_email: string | null;
  student_first_name: string | null;
  student_last_name: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | null;
  applied_at: string | null;
}

export interface ApplicationCreateRequest {
  internship_id: number;
}

export interface InternshipCreateRequest {
  title: string;
  description?: string | null;
  city?: string | null;
  direction?: string | null;
  salary?: number | null;
  deadline?: string | null;
  images?: File[];
}

export interface InternshipUpdateRequest {
  title?: string | null;
  description?: string | null;
  city?: string | null;
  direction?: string | null;
  salary?: number | null;
  deadline?: string | null;
  status?: "ACTIVE" | "CLOSED" | "ARCHIVED" | null;
}


// Удобные алиасы
export type InternshipItem = InternshipResponse;
export type ApplicationItem = StudentApplicationResponse;