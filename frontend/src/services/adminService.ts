import { AdminUser, AdminEmployer, AdminStats } from '../types/admin';
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

  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get<AdminStats>(`${API_BASE}/stats`);
    return response.data;
  },
};
