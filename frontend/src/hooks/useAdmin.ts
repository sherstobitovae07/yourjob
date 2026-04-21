'use client';

import { useState, useEffect } from 'react';
import { AdminUser, AdminEmployer, AdminStats } from '../types/admin';
import { adminService } from '../services/adminService';
import { getHttpErrorMessage } from '../utils/errorUtils';

export interface UseAdminResult {
  users: AdminUser[];
  employers: AdminEmployer[];
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}


export const useAdmin = (): UseAdminResult => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [employers, setEmployers] = useState<AdminEmployer[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, employersData, statsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllEmployers(),
        adminService.getStats(),
      ]);
      setUsers(usersData);
      setEmployers(employersData);
      setStats(statsData);
    } catch (err) {
      const message = getHttpErrorMessage(err, 'Ошибка при загрузке данных админ-панели');
      setError(message);
      console.error('Admin panel error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = async () => {
    await fetchData();
  };

  return { users, employers, stats, loading, error, refreshData };
};
