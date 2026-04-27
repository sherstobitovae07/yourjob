"use client";

import { useState } from 'react';
import { adminService } from '@/services/adminService';
import { dashboardService } from '@/services/dashboardService';
import { getHttpErrorMessage } from '@/utils/errorUtils';

export default function useDeleteInternship(scope: 'admin' | 'mine' = 'admin') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteInternship = async (internshipId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      if (scope === 'admin') {
        await adminService.deleteInternship(internshipId);
      } else {
        await dashboardService.deleteMyInternship(internshipId);
      }
      return true;
    } catch (err) {
      const msg = getHttpErrorMessage(err, 'Ошибка при удалении стажировки');
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteInternship, loading, error };
}
