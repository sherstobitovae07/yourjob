'use client';

import React, { useState, useMemo } from 'react';
import styles from '@/styles/components/admin.module.css';
import { InternshipPublicResponse } from '@/types/internship';
import { formatDate } from '@/utils/adminUtils';

interface Props {
  internships: InternshipPublicResponse[];
}

export const InternshipsList: React.FC<Props> = ({ internships }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm) return internships;
    const s = searchTerm.toLowerCase();
    return internships.filter(i => (i.title || '').toLowerCase().includes(s) || (i.company_name || '').toLowerCase().includes(s));
  }, [internships, searchTerm]);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Стажировки ({filtered.length})</h3>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Поиск по названию, компании..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 6 }}
        />
      </div>

      <div className={styles.responsive}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>Название</th>
              <th className={styles.tableHeaderCell}>Компания</th>
              <th className={styles.tableHeaderCell}>Город</th>
              <th className={styles.tableHeaderCell}>Статус</th>
              <th className={styles.tableHeaderCell}>Дата</th>
              <th className={styles.tableHeaderCell} style={{ width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{item.title}</td>
                <td className={styles.tableCell}>{item.company_name}</td>
                <td className={styles.tableCell}>{item.city}</td>
                <td className={styles.tableCell}>{item.status}</td>
                <td className={`${styles.tableCell} ${styles.tableCellSecondary}`}>{formatDate(item.created_at)}</td>
                <td className={styles.tableCell}>
                  <button
                    className={styles.iconButton}
                    onClick={() => window.dispatchEvent(new CustomEvent('admin:open-delete-internship', { detail: { internshipId: item.id } }))}
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

export default InternshipsList;
