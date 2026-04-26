"use client";

import { useState } from 'react';
import { adminService } from '@/services/adminService';
import { getHttpErrorMessage } from '@/utils/errorUtils';

export default function useDeleteInternship() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteInternship = async (internshipId: number) => {
    setLoading(true);
    setError(null);
    try {
      await adminService.deleteInternship(internshipId);
    } catch (err) {
      const msg = getHttpErrorMessage(err, 'Ошибка при удалении стажировки');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return { deleteInternship, loading, error };
}
