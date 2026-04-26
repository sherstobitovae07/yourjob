import { AdminUser, AdminEmployer, AdminStudent, AdminStats } from '../types/admin';
import { apiClient } from '../configs/axiosClient';

const API_BASE = '/admin';

export const adminService = {
  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await apiClient.get<AdminUser[]>(`${API_BASE}/users`);
    return response.data;
  },

  getAllEmployers: async (): Promise<AdminEmployer[]> => {
    const response = await apiClient.get<AdminEmployer[]>(`${API_BASE}/employers`);
    return response.data;
  },

  getAllStudents: async (): Promise<AdminStudent[]> => {
    const response = await apiClient.get<AdminStudent[]>(`${API_BASE}/students`);
    return response.data;
  },

  getPendingStudents: async (): Promise<AdminStudent[]> => {
    const response = await apiClient.get<AdminStudent[]>(`${API_BASE}/students/pending`);
    return response.data;
  },

  getStudentById: async (studentId: number): Promise<any> => {
    const response = await apiClient.get(`${API_BASE}/students/${studentId}`);
    return response.data;
  },

  approveStudent: async (studentId: number): Promise<void> => {
    await apiClient.patch(`${API_BASE}/students/${studentId}/approve`);
  },

  rejectStudent: async (studentId: number, comment: string | null = null): Promise<void> => {
    const payload = comment ? { comment } : {};
    await apiClient.patch(`${API_BASE}/students/${studentId}/reject`, payload);
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get<AdminStats>(`${API_BASE}/stats`);
    return response.data;
  },
  // public internships endpoint (not under admin)
  getAllInternships: async (): Promise<import('../types/internship').InternshipPublicResponse[]> => {
    const response = await apiClient.get<import('../types/internship').InternshipPublicResponse[]>(`/internships`);
    return response.data;
  },

  getApplicationsByInternship: async (internshipId: number): Promise<any[]> => {
    const response = await apiClient.get<any[]>(`/applications/internship/${internshipId}`);
    // debug
    try {
      // eslint-disable-next-line no-console
      console.debug(`GET /applications/internship/${internshipId} status:`, response.status, 'data length:', Array.isArray(response.data) ? response.data.length : 0);
    } catch (e) {
      // ignore
    }
    return response.data ?? [];
  },

  // admin doesn't expose a direct applications list; use reports endpoint for student applications
  getAllApplications: async (): Promise<import('../types/reports').StudentApplicationReportItem[]> => {
    try {
      const response = await apiClient.get<import('../types/reports').StudentApplicationsReportResponse>(`/reports/student-applications`);
      // debug: log status and payload to help trace empty-list issues
      try {
        // eslint-disable-next-line no-console
        console.debug('GET /reports/student-applications status:', response.status, 'data:', response.data);
      } catch (e) {
        // ignore logging errors
      }
      return response.data.applications ?? [];
    } catch (err) {
      console.error('Failed to load student applications report:', err);
      return [];
    }
  },
  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`${API_BASE}/users/${userId}`);
  },
  deleteApplication: async (applicationId: number): Promise<void> => {
    await apiClient.delete(`${API_BASE}/applications/${applicationId}`);
  },

  deleteInternship: async (internshipId: number): Promise<void> => {
    await apiClient.delete(`${API_BASE}/internships/${internshipId}`);
  },
};

