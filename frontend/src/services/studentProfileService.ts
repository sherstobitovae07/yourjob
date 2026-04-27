import { apiClient } from "../configs/axiosClient";
export interface StudentProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "STUDENT";
  university: string | null;
  faculty: string | null;
  specialty: string | null;
  resume_path: string | null;
  photo_path?: string | null;
  // optional verification status from backend: APPROVED | PENDING | REJECTED
  verification_status?: string | null;
  // optional comment left by admin when rejecting verification
  verification_comment?: string | null;
}
export interface StudentProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  university?: string | null;
  faculty?: string | null;
  specialty?: string | null;
  resume_path?: string | null;
}
export const studentProfileService = {
  getProfile: async (): Promise<StudentProfile> => {
    try {
      const res = await apiClient.get("/profile/student/me");
      return res.data;
    } catch (error) {
      console.error("Error fetching student profile:", error);
      throw error;
    }
  },
  getProfileById: async (studentId: number): Promise<StudentProfile> => {
    try {
      const res = await apiClient.get(`/profile/student/${studentId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching student profile by id:", error);
      throw error;
    }
  },
  updateProfile: async (
    data: StudentProfileUpdateRequest | FormData
  ): Promise<StudentProfile> => {
    try {
      let res;
      if (data instanceof FormData) {
        res = await apiClient.put("/profile/student/me", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        res = await apiClient.put("/profile/student/me", data);
      }
      return res.data;
    } catch (error) {
      console.error("Error updating student profile:", error);
      throw error;
    }
  },
  uploadPhoto: async (file: File): Promise<{ message: string }> => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiClient.post('/profile/student/me/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (error) {
      console.error('Error uploading student photo:', error);
      throw error;
    }
  },
  uploadResume: async (file: File): Promise<{ message: string }> => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiClient.post('/profile/student/me/resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (error) {
      console.error('Error uploading student resume:', error);
      throw error;
    }
  },
  // submit current student's profile for verification (resend)
  submitForVerification: async (): Promise<StudentProfile> => {
    try {
      const res = await apiClient.post('/profile/student/me/submit-for-verification');
      return res.data;
    } catch (error) {
      console.error('Error submitting profile for verification:', error);
      throw error;
    }
  },
};
