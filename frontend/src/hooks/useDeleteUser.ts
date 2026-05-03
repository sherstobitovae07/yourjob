'use client';

import { useState } from 'react';
import { adminService } from '@/services/adminService';
import { getHttpErrorMessage } from '@/utils/errorUtils';

export default function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      await adminService.deleteUser(userId);
      return true;
    } catch (err) {
      const msg = getHttpErrorMessage(err, 'Ошибка при удалении пользователя');
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteUser, loading, error };
}

