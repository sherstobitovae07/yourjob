'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/components/admin.module.css';
import { useAdmin } from '@/hooks/useAdmin';
import { logout } from '@/services/authService';
import { AdminStatsPanel } from './AdminStats';
import { UsersList } from './UsersList';
import DeleteUserModal from './DeleteUserModal';
import { EmployersList } from '@/components/dashboard/admin/EmployersList';
import { StudentsList } from '@/components/dashboard/admin/StudentsList';
import { ReportsList } from '@/components/dashboard/ReportsList';
import InternshipsList from './InternshipsList';
import ApplicationsList from './ApplicationsList';
import DeleteInternshipModal from './DeleteInternshipModal';
import DeleteApplicationModal from './DeleteApplicationModal';

type AdminTab = 'overview' | 'users' | 'employers' | 'students' | 'internships' | 'applications' | 'reports';

export const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { users, employers, students, stats, internships, applications, loading, error, refreshData } = useAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [deleteInternshipOpen, setDeleteInternshipOpen] = useState(false);
  const [selectedInternshipId, setSelectedInternshipId] = useState<number | null>(null);
  const [deleteApplicationOpen, setDeleteApplicationOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);

  // listen for events from UsersList to open modal (keeps UsersList simple)
  useEffect(() => {
    const handler = (e: any) => {
      setSelectedUserId(e.detail.userId);
      setDeleteModalOpen(true);
    };
    window.addEventListener('admin:open-delete-user', handler);
    return () => window.removeEventListener('admin:open-delete-user', handler);
  }, []);

  useEffect(() => {
    const h2 = (e: any) => {
      setSelectedInternshipId(e.detail.internshipId);
      setDeleteInternshipOpen(true);
    };
    window.addEventListener('admin:open-delete-internship', h2);
    return () => window.removeEventListener('admin:open-delete-internship', h2);
  }, []);

  useEffect(() => {
    const h3 = (e: any) => {
      setSelectedApplicationId(e.detail.applicationId);
      setDeleteApplicationOpen(true);
    };
    window.addEventListener('admin:open-delete-application', h3);
    return () => window.removeEventListener('admin:open-delete-application', h3);
  }, []);

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
          className={`${styles.adminTab} ${activeTab === 'students' ? styles.adminTabActive : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Студенты
        </button>
        <button
          className={`${styles.adminTab} ${activeTab === 'internships' ? styles.adminTabActive : ''}`}
          onClick={() => setActiveTab('internships')}
        >
          Стажировки
        </button>
        <button
          className={`${styles.adminTab} ${activeTab === 'applications' ? styles.adminTabActive : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Отклики
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
      {activeTab === 'students' && <StudentsList students={students} />}
      {activeTab === 'internships' && <InternshipsList internships={internships} />}
      {activeTab === 'applications' && (
        <>
          {stats && stats.total_applications > 0 && applications.length === 0 ? (
            <div className={styles.errorContainer} style={{ marginBottom: 12 }}>
              <strong>Внимание:</strong> в статистике указаны отклики, но список откликов не загружен. Проверьте консоль разработчика или логи сервера.
            </div>
          ) : null}
          <ApplicationsList applications={applications} />
        </>
      )}
      <DeleteUserModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        userId={selectedUserId}
        onDeleted={() => {
          setSelectedUserId(null);
          refreshData();
        }}
      />
      <DeleteInternshipModal
        open={deleteInternshipOpen}
        onClose={() => setDeleteInternshipOpen(false)}
        internshipId={selectedInternshipId}
        onDeleted={() => {
          setSelectedInternshipId(null);
          refreshData();
        }}
      />
      <DeleteApplicationModal
        open={deleteApplicationOpen}
        onClose={() => setDeleteApplicationOpen(false)}
        applicationId={selectedApplicationId}
        onDeleted={() => {
          setSelectedApplicationId(null);
          refreshData();
        }}
      />
      {activeTab === 'reports' && <ReportsList />}
    </div>
  );
};
