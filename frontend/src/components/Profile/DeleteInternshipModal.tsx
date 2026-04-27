"use client";

import React from "react";
import useDeleteInternship from "@/hooks/useDeleteInternship";
import styles from "@/styles/components/modal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  internshipId: number;
  onDeleted?: () => void;
}

export const DeleteInternshipModal: React.FC<Props> = ({ open, onClose, internshipId, onDeleted }) => {
  const { deleteInternship, loading, error } = useDeleteInternship('mine');

  if (!open) return null;

  const handleDelete = async () => {
    const ok = await deleteInternship(internshipId);
    if (ok) {
      onDeleted && onDeleted();
      onClose();
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.container}>
        <h3 className={styles.title}>Удалить стажировку</h3>
        <p className={styles.description}>Вы действительно хотите удалить эту стажировку? Это действие необратимо.</p>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose} disabled={loading}>
            Отмена
          </button>
          <button className={`${styles.btn} ${styles.btnDelete}`} onClick={handleDelete} disabled={loading}>
            {loading ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInternshipModal;
