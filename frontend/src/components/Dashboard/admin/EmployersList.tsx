'use client';

import { useState, useMemo, useEffect } from 'react';
import styles from '@/styles/components/admin.module.css';
import { AdminEmployer } from '@/types/admin';
import { formatDate, getFullName, filterEmployers } from '@/utils/adminUtils';
import { adminService } from '@/services/adminService';
import { getFileUrl } from '@/utils/fileHelper';
import EmployerVerificationForm from './EmployerVerificationForm';

interface EmployersListProps {
  employers: AdminEmployer[];
}

export const EmployersList: React.FC<EmployersListProps> = ({ employers }) => {
  const [localEmployers, setLocalEmployers] = useState<AdminEmployer[]>(employers);
  useEffect(() => setLocalEmployers(employers), [employers]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [pendingEmployers, setPendingEmployers] = useState<AdminEmployer[] | null>(null);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<AdminEmployer | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredEmployers = useMemo(() => {
    const source = pendingOnly ? (pendingEmployers ?? []) : localEmployers;
    const actualEmployers = source.filter((emp) => emp.company_name && emp.company_name.trim() !== '');
    return filterEmployers(actualEmployers, searchTerm);
  }, [localEmployers, pendingOnly, pendingEmployers, searchTerm]);

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
    <div className={`${styles.section} ${styles.wideRows}`}>
      <h3 className={styles.sectionTitle}>Работодатели ({filteredEmployers.length})</h3>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1 }} className={styles.searchRow}>
          <input
            type="text"
            placeholder="Поиск по компании, email, ФИ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div style={{ whiteSpace: 'nowrap' }}>
          <button
            className={styles.reportBtn}
            onClick={async () => {
              const newVal = !pendingOnly;
              setPendingOnly(newVal);
              setPendingError(null);
              if (newVal && pendingEmployers === null) {
                try {
                  setPendingLoading(true);
                  const list = await adminService.getPendingEmployers();
                  setPendingEmployers(list);
                } catch (err) {
                  console.error('Failed to load pending employers:', err);
                  setPendingError('Не удалось загрузить ожидающих работодателей');
                } finally {
                  setPendingLoading(false);
                }
              }
            }}
            disabled={pendingLoading}
          >
            {pendingLoading ? 'Загрузка...' : pendingOnly ? 'Показать все' : 'Только ожидающие'}
          </button>
        </div>
      </div>

      {pendingError && <div style={{ color: 'var(--danger, #d93025)', marginBottom: 12 }}>{pendingError}</div>}

      <div className={styles.responsive}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>Компания</th>
              <th className={styles.tableHeaderCell}>Email</th>
              <th className={styles.tableHeaderCell}>ФИ</th>
              <th className={styles.tableHeaderCell}>Сайт</th>
              <th className={styles.tableHeaderCell}>Дата создания</th>
              <th className={styles.tableHeaderCell}>Статус</th>
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
                <td className={`${styles.tableCell} ${styles.statusCell}`}>
                  <span className={styles.statusText}>
                    {(() => {
                      const raw = (employer as any).verification_status ?? (employer as any).status ?? '';
                      const st = String(raw).toUpperCase();
                      if (!st) return '-';
                      if (st === 'APPROVED') return 'Одобрено';
                      if (st === 'PENDING') return 'На рассмотрении';
                      if (st === 'REJECTED') return 'Отклонено';
                      return raw;
                    })()}
                  </span>
                  <span className={styles.statusIcon}>
                    <img
                      src="/Grid-View--Streamline-Sharp-Material-Symbols.svg"
                      alt="review"
                      className={styles.reviewIcon}
                      onClick={async () => {
                        try {
                          setReviewOpen(true);
                          setReviewLoading(true);
                          setSelectedEmployer(null);
                          const details = await adminService.getEmployerById(employer.id);
                          setSelectedEmployer(details as AdminEmployer);
                        } catch (err) {
                          console.error('Failed to load employer details:', err);
                          setPendingError('Не удалось загрузить данные работодателя');
                          setReviewOpen(false);
                        } finally {
                          setReviewLoading(false);
                        }
                      }}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Review modal for employer */}
      {reviewOpen && (
        <div className={styles.modalBackdrop} onClick={() => { if (!actionLoading) { setReviewOpen(false); setSelectedEmployer(null); } }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Просмотр профиля работодателя</h3>
            </div>
            <div className={styles.modalBody}>
              {reviewLoading || !selectedEmployer ? (
                <div>Загрузка...</div>
              ) : (
                <div>
                  {selectedEmployer.photo_path ? (
                    <div style={{ marginBottom: 12 }}>
                      <img src={getFileUrl(selectedEmployer.photo_path)} alt="photo" style={{ width: 140, height: 'auto', borderRadius: 8, objectFit: 'cover' }} />
                    </div>
                  ) : null}
                  <p><strong>Компания:</strong> {selectedEmployer.company_name || 'Не указана'}</p>
                  <p><strong>ИНН:</strong> {selectedEmployer.inn || '-'}</p>
                  <p><strong>Название в ФНС:</strong> {selectedEmployer.fns_company_name || '-'}</p>
                  <p><strong>Результат проверки ФНС:</strong> {selectedEmployer.fns_check_status || '-'}</p>
                  <p><strong>Комментарий ФНС:</strong> {selectedEmployer.fns_check_comment || '-'}</p>
                  <p><strong>Email:</strong> {selectedEmployer.email}</p>
                  <p><strong>Вебсайт:</strong> {selectedEmployer.website || 'Не указан'}</p>
                  <p><strong>Комментарий модерации:</strong> {selectedEmployer.verification_comment || '-'}</p>

                  <EmployerVerificationForm
                    employerId={selectedEmployer.id}
                    onUpdated={async (status, comment) => {
                      const id = selectedEmployer.id;
                      setSelectedEmployer((s) => s ? ({ ...s, verification_status: status === 'APPROVED' ? 'APPROVED' : 'REJECTED', verification_comment: comment ?? s.verification_comment }) : s);
                      setPendingEmployers((list) => list ? list.filter(x => x.id !== id) : list);
                      setLocalEmployers((list) => list.map(x => x.id === id ? ({ ...x, verification_status: status === 'APPROVED' ? 'APPROVED' : 'REJECTED', verification_comment: comment ?? x.verification_comment }) : x));
                      setReviewOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
