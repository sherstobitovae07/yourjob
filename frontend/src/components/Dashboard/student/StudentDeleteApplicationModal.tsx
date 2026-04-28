'use client';

import React, { useState } from 'react';
import { dashboardService } from '@/services/dashboardService';
import styles from '@/styles/components/modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  applicationId: number | null;
  onDeleted?: () => void;
}

const StudentDeleteApplicationModal: React.FC<Props> = ({ open, onClose, applicationId, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || applicationId == null) return null;

const handleDelete = async () => {
    setError(null);
    try {
      setLoading(true);
      await dashboardService.deleteMyApplication(applicationId);
      onDeleted && onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить заявку');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.container}>
        <h3 className={styles.title}>Удалить заявку</h3>
        <p className={styles.description}>Вы уверены, что хотите удалить эту заявку? Действие необратимо.</p>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose} disabled={loading}>
            Отмена
          </button>
          <button className={`${styles.btn} ${styles.btnDelete}`} onClick={handleDelete} disabled={loading}>
            {loading ? 'Удаление...' : 'Удалить заявку'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDeleteApplicationModal;
