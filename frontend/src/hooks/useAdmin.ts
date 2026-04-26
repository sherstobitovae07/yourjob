'use client';

import { useState, useEffect } from 'react';
import { AdminUser, AdminEmployer, AdminStudent, AdminStats } from '../types/admin';
import { InternshipPublicResponse } from '../types/internship';
import { StudentApplicationReportItem } from '../types/reports';
import { adminService } from '../services/adminService';
import { getHttpErrorMessage } from '../utils/errorUtils';

export interface UseAdminResult {
  users: AdminUser[];
  employers: AdminEmployer[];
  students: AdminStudent[];
  stats: AdminStats | null;
  internships: InternshipPublicResponse[];
  applications: StudentApplicationReportItem[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const useAdmin = (): UseAdminResult => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [employers, setEmployers] = useState<AdminEmployer[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [internships, setInternships] = useState<InternshipPublicResponse[]>([]);
  const [applications, setApplications] = useState<StudentApplicationReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data with individual error handling for each request
      let usersData: AdminUser[] = [];
      let employersData: AdminEmployer[] = [];
      let studentsData: AdminStudent[] = [];
      let statsData: AdminStats | null = null;
      let internshipsData: InternshipPublicResponse[] = [];
      let applicationsData: StudentApplicationReportItem[] = [];
      let hasError = false;
      
      try {
        usersData = await adminService.getAllUsers();
      } catch (err) {
        console.error('Error fetching users:', err);
        hasError = true;
      }
      
      try {
        employersData = await adminService.getAllEmployers();
      } catch (err) {
        console.error('Error fetching employers:', err);
        hasError = true;
      }

      try {
        statsData = await adminService.getStats();
      } catch (err) {
        console.error('Error fetching stats:', err);
        // stats are non-critical for the rest of the panel
      }

      try {
        studentsData = await adminService.getAllStudents();
      } catch (err) {
        console.error('Error fetching students:', err);
        hasError = true;
      }

      try {
        internshipsData = await adminService.getAllInternships();
      } catch (err) {
        console.error('Error fetching internships:', err);
        hasError = true;
      }

      try {
        applicationsData = await adminService.getAllApplications();
      } catch (err) {
        console.error('Error fetching applications:', err);
        // expose a more specific error so UI can surface it during debugging
        try {
          const msg = getHttpErrorMessage(err, 'Error fetching applications');
          setError(msg);
        } catch (e) {
          // ignore
        }
        hasError = true;
      }
      
      setUsers(usersData);
      setEmployers(employersData);
      setStudents(studentsData);
      setStats(statsData);
      setInternships(internshipsData);
      setApplications(applicationsData);
      // debug: log the loaded applications count to help trace empty list issues
      console.debug('Admin applications loaded:', (applicationsData || []).length);
      
      if (hasError) {
        setError('Some data failed to load. Please refresh to try again.');
      }
    } catch (err) {
      const message = getHttpErrorMessage(err, 'Error loading admin panel data');
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

  return { users, employers, students, stats, internships, applications, loading, error, refreshData };
};