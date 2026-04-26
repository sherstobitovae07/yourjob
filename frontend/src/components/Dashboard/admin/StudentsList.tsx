'use client';

import { useState, useMemo } from 'react';
import styles from '@/styles/components/admin.module.css';
import { AdminStudent } from '@/types/admin';
import { formatDate, getFullName, filterStudents } from '@/utils/adminUtils';
import { getFileUrl } from '@/utils/fileHelper';
import { adminService } from '@/services/adminService';

interface StudentsListProps {
  students: AdminStudent[];
}

export const StudentsList: React.FC<StudentsListProps> = ({ students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [pendingStudents, setPendingStudents] = useState<AdminStudent[] | null>(null);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredStudents = useMemo(() => {
    const source = pendingOnly ? (pendingStudents ?? []) : students;
    return filterStudents(source, searchTerm);
  }, [students, pendingOnly, pendingStudents, searchTerm]);

  if (filteredStudents.length === 0 && students.length === 0) {
    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Студенты</h3>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateText}>Нет студентов</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Студенты ({filteredStudents.length})</h3>

      <div style={{ marginBottom: '15px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Поиск по email, ФИ, университету..."
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
        <div style={{ whiteSpace: 'nowrap' }}>
          <button
            className={styles.reportBtn}
            onClick={async () => {
              const newVal = !pendingOnly;
              setPendingOnly(newVal);
              setPendingError(null);
              if (newVal && pendingStudents === null) {
                // load pending students from API
                try {
                  setPendingLoading(true);
                  const list = await adminService.getPendingStudents();
                  setPendingStudents(list);
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.error('Failed to load pending students:', err);
                  setPendingError('Не удалось загрузить ожидающих студентов');
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
              <th className={styles.tableHeaderCell}>Email</th>
              <th className={styles.tableHeaderCell}>ФИ</th>
              <th className={styles.tableHeaderCell}>Университет</th>
              <th className={styles.tableHeaderCell}>Специализация</th>
              <th className={styles.tableHeaderCell}>Год выпуска</th>
              <th className={styles.tableHeaderCell}>Дата создания</th>
              <th className={styles.tableHeaderCell}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{student.email || 'Не указан'}</td>
                <td className={styles.tableCell}>{getFullName(student.first_name, student.last_name)}</td>
                <td className={styles.tableCell}>{student.university || 'Не указан'}</td>
                <td className={styles.tableCell}>{student.specialization || 'Не указана'}</td>
                <td className={styles.tableCell}>{student.graduation_year || 'Не указан'}</td>
                <td className={`${styles.tableCell} ${styles.tableCellSecondary}`}>
                  {formatDate(student.created_at)}
                </td>
                <td className={`${styles.tableCell} ${styles.statusCell}`}>
                  <span className={styles.statusText}>
                    {(() => {
                      const raw = student.verification_status ?? student.status ?? '';
                      const st = String(raw).toUpperCase();
                      if (!st) return '-';
                      if (st === 'APPROVED') return 'Одобрено';
                      if (st === 'PENDING') return 'Ожидает одобрения';
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
                          setSelectedStudent(null);
                          const details = await adminService.getStudentById(student.id);
                          setSelectedStudent(details as AdminStudent);
                        } catch (err) {
                          // eslint-disable-next-line no-console
                          console.error('Failed to load student details:', err);
                          setPendingError('Не удалось загрузить данные студента');
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
      {/* Review modal */}
      {reviewOpen && (
        <div className={styles.modalBackdrop} onClick={() => { if (!actionLoading) { setReviewOpen(false); setSelectedStudent(null); } }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Просмотр профиля студента</h3>
            </div>
            <div className={styles.modalBody}>
              {reviewLoading || !selectedStudent ? (
                <div>Загрузка...</div>
              ) : (
                <div>
                  {selectedStudent.photo_path ? (
                    <div style={{ marginBottom: 12 }}>
                      <img src={getFileUrl(selectedStudent.photo_path)} alt="photo" style={{ width: 140, height: 'auto', borderRadius: 8, objectFit: 'cover' }} />
                    </div>
                  ) : null}
                  <p><strong>ФИ:</strong> {getFullName(selectedStudent.first_name, selectedStudent.last_name)}</p>
                  <p><strong>Email:</strong> {selectedStudent.email}</p>
                  <p><strong>Университет:</strong> {selectedStudent.university || 'Не указан'}</p>
                  <p><strong>Факультет:</strong> {selectedStudent.faculty || 'Не указан'}</p>
                  <p><strong>Специальность:</strong> {selectedStudent.specialization || 'Не указана'}</p>
                  <p><strong>Комментарий модерации:</strong> {selectedStudent.verification_comment || '-'}</p>
                  {selectedStudent.resume_path ? (
                    <p><a href={getFileUrl(selectedStudent.resume_path)} target="_blank" rel="noreferrer">Открыть резюме</a></p>
                  ) : (
                    <p style={{ color: '#6b7280' }}>Резюме не загружено</p>
                  )}
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.reportBtnSecondary}
                onClick={async () => {
                  if (!selectedStudent) return;
                  try {
                    setActionLoading(true);
                    await adminService.rejectStudent(selectedStudent.id, 'Отклонено администратором');
                    // update local state
                    const id = selectedStudent.id;
                    setSelectedStudent((s) => s ? ({ ...s, verification_status: 'REJECTED' }) : s);
                    // update lists
                    setPendingStudents((list) => list ? list.filter(x => x.id !== id) : list);
                    // also update main students array via DOM state by calling replace in place - we can't change prop, but we can notify user to refresh
                    setReviewOpen(false);
                  } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('Reject failed', err);
                  } finally {
                    setActionLoading(false);
                  }
                }}
                disabled={actionLoading}
              >
                Отклонить
              </button>
              <button
                className={styles.reportBtn}
                onClick={async () => {
                  if (!selectedStudent) return;
                  try {
                    setActionLoading(true);
                    await adminService.approveStudent(selectedStudent.id);
                    const id = selectedStudent.id;
                    setSelectedStudent((s) => s ? ({ ...s, verification_status: 'APPROVED' }) : s);
                    setPendingStudents((list) => list ? list.filter(x => x.id !== id) : list);
                    setReviewOpen(false);
                  } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('Approve failed', err);
                  } finally {
                    setActionLoading(false);
                  }
                }}
                disabled={actionLoading}
              >
                Одобрить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
