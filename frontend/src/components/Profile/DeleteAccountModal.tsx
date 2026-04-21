"use client";

import React from 'react';
import useDeleteAccount from '@/hooks/useDeleteAccount';
import styles from '@/styles/components/modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export const DeleteAccountModal: React.FC<Props> = ({ open, onClose, onDeleted }) => {
  const { deleteAccount, loading, error } = useDeleteAccount();

  if (!open) return null;

  const handleDelete = async () => {
    try {
      await deleteAccount();
      onDeleted && onDeleted();
      onClose();
    } catch (err) {
      // error handled in hook; keep modal open so user can retry or cancel
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.container}>
        <h3 className={styles.title}>Удалить аккаунт</h3>
        <p className={styles.description}>Вы действительно хотите удалить аккаунт? Это действие необратимо. Все ваши данные будут удалены.</p>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose}>
            Отмена
          </button>
          <button className={`${styles.btn} ${styles.btnDelete}`} onClick={handleDelete} disabled={loading}>
            {loading ? 'Удаление...' : 'Удалить аккаунт'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
