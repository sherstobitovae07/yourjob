import axios from "axios";
import { apiClient } from "../configs/axiosClient";
export interface EmployerProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "EMPLOYER";
  company_name: string | null;
  description: string | null;
  website: string | null;
}
export interface EmployerProfileUpdateRequest {
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  description?: string | null;
  website?: string | null;
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
};
