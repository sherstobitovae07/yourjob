"use client";
import React, { useState } from 'react';
import modalStyles from '@/styles/components/modal.module.css';
import { articleService } from '@/services/articleService';

interface Props {
  open: boolean;
  action: 'publish' | 'delete' | null;
  articleId: number | null;
  onClose: () => void;
  onConfirmed?: () => void;
}

export default function ArticleConfirmModal({ open, action, articleId, onClose, onConfirmed }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !action || articleId == null) return null;

  const title = action === 'publish' ? 'Опубликовать статью' : 'Удалить статью';
  const description = action === 'publish'
    ? 'Вы уверены, что хотите опубликовать эту статью? После публикации она станет доступна всем пользователям.'
    : 'Вы уверены, что хотите удалить эту статью? Удаление невозможно будет отменить.';

  const handleConfirm = async () => {
    setError(null);
    try {
      setLoading(true);
      if (action === 'publish') {
        await articleService.publishArticle(articleId);
      } else {
        await articleService.deleteArticle(articleId);
      }
      onConfirmed && onConfirmed();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при выполнении операции');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={modalStyles.root}>
      <div className={modalStyles.backdrop} onClick={() => { if (!loading) onClose(); }} />
      <div className={modalStyles.container}>
        <button className="modal-close" onClick={() => { if (!loading) onClose(); }}>×</button>
        <h3 className={modalStyles.title}>{title}</h3>
        <p className={modalStyles.description}>{description}</p>
        {error && <p className={modalStyles.error}>{error}</p>}
        <div className={modalStyles.footer}>
          <button className={`${modalStyles.btn} ${modalStyles.btnCancel}`} onClick={onClose} disabled={loading}>Отмена</button>
          <button className={`${modalStyles.btn} ${modalStyles.btnDelete}`} onClick={handleConfirm} disabled={loading}>
            {loading ? (action === 'publish' ? 'Публикация...' : 'Удаление...') : (action === 'publish' ? 'Опубликовать' : 'Удалить')}
          </button>
        </div>
      </div>
    </div>
  );
}
