'use client';

import { useState, useMemo } from 'react';
import styles from '@/styles/components/admin.module.css';
import { AdminUser } from '../../types/admin';
import { formatDate, getFullName, getRoleBadgeClass, getRoleDisplay, filterUsers } from '../../utils/adminUtils';

interface UsersListProps {
  users: AdminUser[];
}

export const UsersList: React.FC<UsersListProps> = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => filterUsers(users, searchTerm), [users, searchTerm]);

  if (filteredUsers.length === 0 && users.length === 0) {
    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Пользователи</h3>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>👥</div>
          <div className={styles.emptyStateText}>Нет пользователей</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Пользователи ({filteredUsers.length})</h3>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Поиск по названию, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e5e5e5',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div className={styles.responsive}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>Email</th>
              <th className={styles.tableHeaderCell}>ФИ</th>
              <th className={styles.tableHeaderCell}>Роль</th>
              <th className={styles.tableHeaderCell}>Дата создания</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{user.email}</td>
                <td className={styles.tableCell}>{getFullName(user.first_name, user.last_name)}</td>
                <td className={styles.tableCell}>
                  <span className={`${styles.badge} ${styles[getRoleBadgeClass(user.role)]}`}>
                    {getRoleDisplay(user.role)}
                  </span>
                </td>
                <td className={`${styles.tableCell} ${styles.tableCellSecondary}`}>
                  {formatDate(user.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
