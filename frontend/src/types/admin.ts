import { UserRole } from './auth';

export interface AdminUser {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  created_at: string | null;
}

export interface AdminEmployer {
  id: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  description: string | null;
  website: string | null;
  created_at: string | null;
}

export interface AdminStudent {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  university: string | null;
  specialization: string | null;
  graduation_year: number | null;
  created_at: string | null;
  // verification status coming from backend: APPROVED | PENDING | REJECTED
  verification_status?: string | null;
  // some backend endpoints return `status` key instead of `verification_status`
  status?: string | null;
  // additional fields returned by admin student details
  faculty?: string | null;
  resume_path?: string | null;
  photo_path?: string | null;
  verification_comment?: string | null;
}

export interface AdminStats {
  total_users: number;
  total_students: number;
  total_employers: number;
  total_admins: number;
  total_internships: number;
  total_applications: number;
}
