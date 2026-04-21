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

export interface AdminStats {
  total_users: number;
  total_students: number;
  total_employers: number;
  total_admins: number;
  total_internships: number;
  total_applications: number;
}
