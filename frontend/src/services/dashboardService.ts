
import { apiClient } from "../configs/axiosClient";
import type {
  StudentProfileResponse,
  EmployerProfileResponse,
  InternshipPublicResponse,
  InternshipResponse,
  InternshipCreateRequest,
  InternshipUpdateRequest,
  StudentApplicationResponse,
  ApplicationResponse,
  ApplicationCreateRequest,
  InternshipApplicationResponse,
} from "../types/dashboard";
export const dashboardService = {
  getCurrentUser: async () => {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },
  getStudentProfile: async (): Promise<StudentProfileResponse> => {
    const res = await apiClient.get("/profile/student/me");
    return res.data;
  },
  getEmployerProfile: async (): Promise<EmployerProfileResponse> => {
    const res = await apiClient.get("/profile/employer/me");
    return res.data;
  },
  getStudentProfileById: async (studentId: number): Promise<StudentProfileResponse> => {
    const res = await apiClient.get(`/profile/student/${studentId}`);
    return res.data;
  },
  getActiveInternships: async (): Promise<InternshipPublicResponse[]> => {
    const res = await apiClient.get("/internships");
    return res.data;
  },
  getMyInternships: async (): Promise<InternshipResponse[]> => {
    const res = await apiClient.get("/internships/my");
    return res.data;
  },
  applyToInternship: async (internship_id: number): Promise<ApplicationResponse> => {
    const payload: ApplicationCreateRequest = { internship_id };
    const res = await apiClient.post("/applications", payload);
    return res.data;
  },
  createInternship: async (payload: InternshipCreateRequest | FormData): Promise<InternshipResponse> => {
    if (payload instanceof FormData) {
      const res = await apiClient.post("/internships", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    }
    const res = await apiClient.post("/internships", payload);
    return res.data;
  },
  getMyInternshipById: async (internship_id: number): Promise<InternshipResponse> => {
    const res = await apiClient.get(`/internships/my/${internship_id}`);
    return res.data;
  },
  updateMyInternship: async (internship_id: number, payload: InternshipUpdateRequest): Promise<InternshipResponse> => {
    const res = await apiClient.put(`/internships/my/${internship_id}`, payload);
    return res.data;
  },
  deleteMyInternship: async (internship_id: number): Promise<void> => {
    const res = await apiClient.delete(`/internships/my/${internship_id}`);
    return res.data;
  },
  uploadEmployerPhoto: async (file: File): Promise<{ message: string }> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await apiClient.post('/profile/employer/me/photo', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getPublicInternshipById: async (internship_id: number): Promise<InternshipPublicResponse> => {
    const res = await apiClient.get(`/internships/${internship_id}`);
    return res.data;
  },
  getMyApplications: async (): Promise<StudentApplicationResponse[]> => {
    const res = await apiClient.get("/applications/my");
    return res.data;
  },
  getApplicationsByInternship: async (internship_id: number): Promise<InternshipApplicationResponse[]> => {
    const res = await apiClient.get(`/applications/internship/${internship_id}`);
    return res.data;
  },
  updateApplicationStatus: async (application_id: number, payload: { status: string }): Promise<ApplicationResponse> => {
    const res = await apiClient.put(`/applications/${application_id}/status`, payload);
    return res.data;
  },
};
