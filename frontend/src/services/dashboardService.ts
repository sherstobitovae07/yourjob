
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
  // Normalize backend internship object to include `image_url` derived from `photo_path`.
  _normalizeInternship: (obj: any) => {
    if (!obj) return obj;
    if (obj.photo_path && !obj.image_url) {
      // Ensure backslashes -> slashes and prefix with backend base URL so
      // browser requests go to the backend static files mount (/media/...)
      const raw = String(obj.photo_path).replace(/\\/g, '/');
      const backendBase = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8001';
      // photo_path is stored like "media/internships/xxx.jpg"
      const rel = raw.startsWith('/') ? raw.substring(1) : raw;
      obj.image_url = `${backendBase}/${rel}`;
    }
    return obj;
  },
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
  getActiveInternships: async (filters?: {
    q?: string | null;
    city?: string | null;
    direction?: string | null;
    min_salary?: number | null;
    max_salary?: number | null;
  }): Promise<InternshipPublicResponse[]> => {
    const res = await apiClient.get("/internships", { params: filters });
    return (res.data || []).map((i: any) => dashboardService._normalizeInternship(i));
  },
  getMyInternships: async (): Promise<InternshipResponse[]> => {
    const res = await apiClient.get("/internships/my");
    return (res.data || []).map((i: any) => dashboardService._normalizeInternship(i));
  },
  applyToInternship: async (internship_id: number): Promise<ApplicationResponse> => {
    const payload: ApplicationCreateRequest = { internship_id };
    const res = await apiClient.post("/applications", payload);
    return res.data;
  },
  createInternship: async (payload: InternshipCreateRequest | FormData): Promise<InternshipResponse> => {
    if (payload instanceof FormData) {
      // Ensure we don't send the default application/json header; set Content-Type undefined
      const res = await apiClient.post("/internships", payload, {
        headers: { 'Content-Type': undefined },
      });
      return dashboardService._normalizeInternship(res.data);
    }
    const res = await apiClient.post("/internships", payload);
    return dashboardService._normalizeInternship(res.data);
  },
  getMyInternshipById: async (internship_id: number): Promise<InternshipResponse> => {
    const res = await apiClient.get(`/internships/my/${internship_id}`);
    return dashboardService._normalizeInternship(res.data);
  },
  updateMyInternship: async (internship_id: number, payload: InternshipUpdateRequest): Promise<InternshipResponse> => {
    const res = await apiClient.put(`/internships/my/${internship_id}`, payload);
    return dashboardService._normalizeInternship(res.data);
  },
  deleteMyInternship: async (internship_id: number): Promise<void> => {
    const res = await apiClient.delete(`/internships/my/${internship_id}`);
    return res.data;
  },
  uploadMyInternshipPhoto: async (internship_id: number, file: File): Promise<void> => {
    const fd = new FormData();
    fd.append('file', file);
    // Reset Content-Type so axios/browser set proper multipart boundary
    const res = await apiClient.post(`/internships/my/${internship_id}/photo`, fd, {
      headers: { 'Content-Type': undefined },
    });
    return res.data;
  },
  uploadEmployerPhoto: async (file: File): Promise<{ message: string }> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await apiClient.post('/profile/employer/me/photo', fd, {
      headers: { 'Content-Type': undefined },
    });
    return res.data;
  },
  getPublicInternshipById: async (internship_id: number): Promise<InternshipPublicResponse> => {
    const res = await apiClient.get(`/internships/${internship_id}`);
    return dashboardService._normalizeInternship(res.data);
  },
  getMyApplications: async (): Promise<StudentApplicationResponse[]> => {
    const res = await apiClient.get("/applications/my");
    return res.data;
  },
  deleteMyApplication: async (application_id: number): Promise<void> => {
    const res = await apiClient.delete(`/applications/my/${application_id}`);
    return res.data;
  },
  getApplicationsByInternship: async (internship_id: number): Promise<InternshipApplicationResponse[]> => {
    const res = await apiClient.get(`/applications/internship/${internship_id}`);
    return res.data;
  },
  deleteApplicationAsEmployer: async (application_id: number): Promise<void> => {
    const res = await apiClient.delete(`/applications/employer/${application_id}`);
    return res.data;
  },
  updateApplicationStatus: async (application_id: number, payload: { status: string }): Promise<ApplicationResponse> => {
    const res = await apiClient.put(`/applications/${application_id}/status`, payload);
    return res.data;
  },
};
