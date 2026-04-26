'use client';

import React from 'react';
import useDeleteUser from '@/hooks/useDeleteUser';
import styles from '@/styles/components/modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  userId: number | null;
  onDeleted?: () => void;
}

export const DeleteUserModal: React.FC<Props> = ({ open, onClose, userId, onDeleted }) => {
  const { deleteUser, loading, error } = useDeleteUser();

  if (!open || userId == null) return null;

  const handleDelete = async () => {
    try {
      await deleteUser(userId);
      onDeleted && onDeleted();
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.container}>
        <h3 className={styles.title}>Удалить пользователя</h3>
        <p className={styles.description}>Вы уверены, что хотите удалить этого пользователя? Действие необратимо.</p>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose} disabled={loading}>
            Отмена
          </button>
          <button className={`${styles.btn} ${styles.btnDelete}`} onClick={handleDelete} disabled={loading}>
            {loading ? 'Удаление...' : 'Удалить пользователя'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
