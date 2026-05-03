'use client';

import { useState, useMemo } from 'react';
import styles from '@/styles/components/admin.module.css';
import { AdminUser } from '../../../types/admin';
import { formatDate, getFullName, getRoleBadgeClass, getRoleDisplay, filterUsers } from '../../../utils/adminUtils';

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
          <div className={styles.emptyStateText}>Нет пользователей</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Пользователи ({filteredUsers.length})</h3>

      <div className={styles.searchRow}>
        <input
          type="text"
          placeholder="Поиск..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
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
              <th className={styles.tableHeaderCell} style={{ width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{user.email}</td>
                <td className={styles.tableCell}>{getFullName(user.first_name, user.last_name)}</td>
                <td className={styles.tableCell}>{getRoleDisplay(user.role)}</td>
                <td className={`${styles.tableCell} ${styles.tableCellSecondary}`}>
                  {formatDate(user.created_at)}
                </td>
                <td className={styles.tableCell}>
                  <button
                    className={styles.iconButton}
                    onClick={() => {
                      const ev = new CustomEvent('admin:open-delete-user', { detail: { userId: user.id } });
                      window.dispatchEvent(ev as any);
                    }}
                    title="Удалить"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <img src="/Delete--Streamline-Sharp-Material-Symbols.svg" alt="Удалить" style={{ width: 18, height: 18 }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
