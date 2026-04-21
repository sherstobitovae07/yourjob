import { apiClient } from "../configs/axiosClient";
export const profileService = {
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/profile/me');
  },
};

export default profileService;
