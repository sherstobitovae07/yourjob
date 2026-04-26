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
    } catch (err) {
      const msg = getHttpErrorMessage(err, 'РћС€РёР±РєР° РїСЂРё СѓРґР°Р»РµРЅРёРё РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ');
      setError(msg);
      
    } finally {
      setLoading(false);
    }
  };

  return { deleteUser, loading, error };
}

