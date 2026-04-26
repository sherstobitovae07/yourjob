'use client';

import React, { useState, useMemo } from 'react';
import styles from '@/styles/components/admin.module.css';
import { StudentApplicationReportItem } from '@/types/reports';
import { formatDate } from '@/utils/adminUtils';

interface Props {
  applications: StudentApplicationReportItem[];
}

export const ApplicationsList: React.FC<Props> = ({ applications }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm) return applications;
    const s = searchTerm.toLowerCase();
    return applications.filter(a => (a.student_full_name || '').toLowerCase().includes(s) || (a.internship_title || '').toLowerCase().includes(s));
  }, [applications, searchTerm]);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Отклики ({filtered.length})</h3>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Поиск по студенту, стажировке..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 6 }}
        />
      </div>

      <div className={styles.responsive}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>Студент</th>
              <th className={styles.tableHeaderCell}>Стажировка</th>
              <th className={styles.tableHeaderCell}>Компания</th>
              <th className={styles.tableHeaderCell}>Дата</th>
              <th className={styles.tableHeaderCell}>Статус</th>
              <th className={styles.tableHeaderCell} style={{ width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.application_id} className={styles.tableRow}>
                <td className={styles.tableCell}>{item.student_full_name}</td>
                <td className={styles.tableCell}>{item.internship_title}</td>
                <td className={styles.tableCell}>{item.company_name}</td>
                <td className={`${styles.tableCell} ${styles.tableCellSecondary}`}>{formatDate(item.applied_at)}</td>
                <td className={styles.tableCell}>{item.status}</td>
                <td className={styles.tableCell}>
                  <button
                    className={styles.iconButton}
                    onClick={() => window.dispatchEvent(new CustomEvent('admin:open-delete-application', { detail: { applicationId: item.application_id } }))}
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

export default ApplicationsList;
