'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/components/admin.module.css';
import { useAdmin } from '../../hooks/useAdmin';
import { logout } from '../../services/authService';
import { AdminStatsPanel } from './AdminStats';
import { UsersList } from './UsersList';
import { EmployersList } from './EmployersList';
import { ReportsList } from './ReportsList';

type AdminTab = 'overview' | 'users' | 'employers' | 'reports';

export const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { users, employers, stats, loading, error, refreshData } = useAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <span>Загрузка данных администратора...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.adminHeader}>
          <h1 className={styles.adminTitle}>Панель администратора</h1>
          <div className={styles.headerActions}>
            <button className={styles.logoutBtn} onClick={() => { logout(); router.push('/auth'); }}>
              Выйти
            </button>
          </div>
        </div>
        <div className={styles.errorContainer}>
          <strong>Нет доступа:</strong> {error}
        </div>
        <div>
          <button className={styles.refreshBtn} onClick={refreshData}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Панель администратора</h1>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={refreshData} disabled={loading}>
            {loading ? 'Загрузка...' : 'Обновить'}
          </button>
          <button className={styles.logoutBtn} onClick={() => { logout(); router.push('/auth'); }}>
            Выйти
          </button>
        </div>
      </div>

      <div className={styles.adminTabs}>
        <button
          className={`${styles.adminTab} ${activeTab === 'overview' ? styles.adminTabActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Обзор
        </button>
        <button
          className={`${styles.adminTab} ${activeTab === 'users' ? styles.adminTabActive : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Пользователи
        </button>
        <button
          className={`${styles.adminTab} ${activeTab === 'employers' ? styles.adminTabActive : ''}`}
          onClick={() => setActiveTab('employers')}
        >
          Работодатели
        </button>
        <button
          className={`${styles.adminTab} ${activeTab === 'reports' ? styles.adminTabActive : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Отчёты
        </button>
      </div>

      {activeTab === 'overview' && stats && <AdminStatsPanel stats={stats} />}
      {activeTab === 'users' && <UsersList users={users} />}
      {activeTab === 'employers' && <EmployersList employers={employers} />}
      {activeTab === 'reports' && <ReportsList />}
    </div>
  );
};
