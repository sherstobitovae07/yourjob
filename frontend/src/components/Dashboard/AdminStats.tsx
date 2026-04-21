'use client';

import styles from '@/styles/components/admin.module.css';
import { AdminStats } from '../../types/admin';

interface AdminStatsProps {
  stats: AdminStats;
}

export const AdminStatsPanel: React.FC<AdminStatsProps> = ({ stats }) => {
  const statsData = [
    { label: 'Всего пользователей', value: stats.total_users },
    { label: 'Студентов', value: stats.total_students },
    { label: 'Работодателей', value: stats.total_employers },
    { label: 'Администраторов', value: stats.total_admins },
    { label: 'Стажировок', value: stats.total_internships },
    { label: 'Откликов', value: stats.total_applications },
  ];

  return (
    <div className={styles.statsGrid}>
      {statsData.map((stat, idx) => (
        <div key={idx} className={styles.statCard}>
          <div className={styles.statLabel}>{stat.label}</div>
          <div className={styles.statValue}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
};
