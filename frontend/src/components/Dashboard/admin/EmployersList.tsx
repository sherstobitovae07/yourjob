'use client';

import { useState, useMemo } from 'react';
import styles from '@/styles/components/admin.module.css';
import { AdminEmployer } from '@/types/admin';
import { formatDate, getFullName, filterEmployers } from '@/utils/adminUtils';

interface EmployersListProps {
  employers: AdminEmployer[];
}

export const EmployersList: React.FC<EmployersListProps> = ({ employers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployers = useMemo(() => {
    // Only show actual employers (those with company_name), excluding admins
    const actualEmployers = employers.filter((emp) => emp.company_name && emp.company_name.trim() !== '');
    return filterEmployers(actualEmployers, searchTerm);
  }, [employers, searchTerm]);

  if (filteredEmployers.length === 0 && employers.length === 0) {
    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Работодатели</h3>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateText}>Нет работодателей</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Работодатели ({filteredEmployers.length})</h3>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Поиск по компании, email, ФИ..."
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
              <th className={styles.tableHeaderCell}>Компания</th>
              <th className={styles.tableHeaderCell}>Email</th>
              <th className={styles.tableHeaderCell}>ФИ</th>
              <th className={styles.tableHeaderCell}>Сайт</th>
              <th className={styles.tableHeaderCell}>Дата создания</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployers.map((employer) => (
              <tr key={employer.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{employer.company_name || 'Не указана'}</td>
                <td className={styles.tableCell}>{employer.email || 'Не указан'}</td>
                <td className={styles.tableCell}>{getFullName(employer.first_name, employer.last_name)}</td>
                <td className={styles.tableCell}>
                  {employer.website ? (
                    <a href={employer.website} target="_blank" rel="noopener noreferrer">
                      {employer.website}
                    </a>
                  ) : (
                    'Не указан'
                  )}
                </td>
                <td className={`${styles.tableCell} ${styles.tableCellSecondary}`}>
                  {formatDate(employer.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
