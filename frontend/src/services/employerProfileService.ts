import { apiClient } from "../configs/axiosClient";
import axios from "axios";

export interface EmployerProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "EMPLOYER";
  company_name: string | null;
  description: string | null;
  website: string | null;
  inn?: string | null;
  photo_path?: string | null;
  verification_status?: string | null;
  verification_comment?: string | null;
  fns_company_name?: string | null;
  fns_check_status?: string | null;
  fns_check_comment?: string | null;
}

export interface EmployerProfileUpdateRequest {
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  description?: string | null;
  website?: string | null;
  inn?: string | null;
}

const normalizeOptional = (value: string | null | undefined): string | null => {
  const normalized = value?.trim();
  return normalized === "" ? null : normalized ?? null;
};

export const employerProfileService = {
  getProfile: async (): Promise<EmployerProfile> => {
    try {
      const res = await apiClient.get("/profile/employer/me");
      return res.data;
    } catch (error) {
      console.error("Error fetching employer profile:", error);
      throw error;
    }
  },
  // submit current employer's profile for verification
  submitForVerification: async (): Promise<EmployerProfile> => {
    try {
      const res = await apiClient.post('/profile/employer/me/submit-for-verification');
      return res.data;
    } catch (error) {
      console.error('Error submitting employer profile for verification:', error);
      throw error;
    }
  },
  updateProfile: async (
    data: EmployerProfileUpdateRequest
  ): Promise<EmployerProfile> => {
    try {
      const payload = {
        first_name: normalizeOptional(data.first_name),
        last_name: normalizeOptional(data.last_name),
        company_name: normalizeOptional(data.company_name),
        description: normalizeOptional(data.description),
        website: normalizeOptional(data.website),
        inn: normalizeOptional(data.inn),
      };
      const res = await apiClient.put("/profile/employer/me", payload);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error updating employer profile:", error.response?.data ?? error.message);
      } else {
        console.error("Error updating employer profile:", error);
      }
      throw error;
    }
  },
  uploadPhoto: async (file: File): Promise<{ message: string }> => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiClient.post('/profile/employer/me/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (error) {
      console.error('Error uploading employer photo:', error);
      throw error;
    }
  },
};
