'use client';

import React from 'react';
import useDeleteApplication from '@/hooks/useDeleteApplication';
import styles from '@/styles/components/modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  applicationId: number | null;
  onDeleted?: () => void;
}

export const DeleteApplicationModal: React.FC<Props> = ({ open, onClose, applicationId, onDeleted }) => {
  const { deleteApplication, loading, error } = useDeleteApplication();

  if (!open || applicationId == null) return null;

  const handleDelete = async () => {
    try {
      await deleteApplication(applicationId);
      onDeleted && onDeleted();
      onClose();
    } catch (err) {
      // handled in hook
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.container}>
        <h3 className={styles.title}>Удалить отклик</h3>
        <p className={styles.description}>Вы уверены, что хотите удалить этот отклик? Действие необратимо.</p>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose} disabled={loading}>
            Отмена
          </button>
          <button className={`${styles.btn} ${styles.btnDelete}`} onClick={handleDelete} disabled={loading}>
            {loading ? 'Удаление...' : 'Удалить отклик'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteApplicationModal;
