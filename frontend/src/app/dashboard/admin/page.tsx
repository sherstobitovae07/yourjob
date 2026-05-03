"use client";

import ReactAdminWrapper from '../../../components/dashboard/admin/ReactAdminWrapper';
import styles from '@/styles/components/admin.module.css';
import { logout } from '@/services/authService';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  return (
    <div className={styles.adminContainer}>
      <ReactAdminWrapper />
    </div>
  );
}
