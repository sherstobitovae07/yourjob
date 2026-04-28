'use client';

import React, { useState } from 'react';
import { dashboardService } from '@/services/dashboardService';
import styles from '@/styles/components/modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  applicationId: number | null;
  targetStatus: 'APPROVED' | 'REJECTED' | null;
  onConfirmed?: (updatedStatus?: string) => void;
}

const ConfirmStatusChangeModal: React.FC<Props> = ({ open, onClose, applicationId, targetStatus, onConfirmed }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || applicationId == null || !targetStatus) return null;

  const title = targetStatus === 'APPROVED' ? 'Принять заявку' : 'Отклонить заявку';
  const description = targetStatus === 'APPROVED'
    ? 'Вы уверены, что хотите принять эту заявку? После подтверждения статус изменится.'
    : 'Вы уверены, что хотите отклонить эту заявку? После подтверждения статус изменится.';

  const handleConfirm = async () => {
    setError(null);
    try {
      setLoading(true);
      const updated = await dashboardService.updateApplicationStatus(applicationId, { status: targetStatus });
      onConfirmed && onConfirmed(updated.status);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить статус');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.container}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose} disabled={loading}>
            Отмена
          </button>
          <button className={`${styles.btn} ${styles.btnDelete}`} onClick={handleConfirm} disabled={loading}>
            {loading ? (targetStatus === 'APPROVED' ? 'Принятие...' : 'Отклонение...') : (targetStatus === 'APPROVED' ? 'Принять' : 'Отклонить')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmStatusChangeModal;
