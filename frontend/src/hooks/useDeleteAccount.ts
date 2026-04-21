"use client";

import { useState } from 'react';
import { profileService } from '@/services/profileService';
import { logout } from '@/services/authService';

export const useDeleteAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      await profileService.deleteAccount();
      logout();
    } catch (err) {
      console.error('deleteAccount error', err);
      const anyErr = err as any;
      const serverMsg = anyErr?.response?.data?.detail || anyErr?.response?.data?.message || anyErr?.message;
      setError(serverMsg || 'Ошибка при удалении аккаунта');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteAccount, loading, error };
};

export default useDeleteAccount;
