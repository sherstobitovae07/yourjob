"use client";

import { useState } from 'react';
import { adminService } from '@/services/adminService';
import { getHttpErrorMessage } from '@/utils/errorUtils';

export default function useDeleteApplication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteApplication = async (applicationId: number) => {
    setLoading(true);
    setError(null);
    try {
      await adminService.deleteApplication(applicationId);
      return true;
    } catch (err) {
      const msg = getHttpErrorMessage(err, 'Ошибка при удалении отклика');
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteApplication, loading, error };
}
