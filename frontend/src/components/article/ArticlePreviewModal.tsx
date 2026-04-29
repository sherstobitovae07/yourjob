"use client";
import React from 'react';
import type { ArticleResponse } from '@/types/article';
import modalStyles from '@/styles/components/modal.module.css';
import pageStyles from '@/app/page.module.css';

interface Props {
  article: ArticleResponse;
  onClose: () => void;
}

export default function ArticlePreviewModal({ article, onClose }: Props) {
  return (
    <div className={modalStyles.root}>
      <div className={modalStyles.backdrop} onClick={onClose} />
      <div
        className={modalStyles.container}
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(1000px, 96%)' }}
      >
        <button className="modal-close" onClick={onClose}>×</button>
        <h3 className={modalStyles.title}>{article.title}</h3>
        <p className={`${modalStyles.description} ${pageStyles.articleAuthor}`} style={{ marginBottom: 12 }}>
          {article.author_name ? `${article.author_name}` : `Автор: ${article.author_id ?? '—'}`}
          {article.created_at ? ` — ${article.created_at.split('T')[0]}` : ''}
        </p>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--modal-text-color, #334155)' }}>{article.content || ''}</div>
      </div>
    </div>
  );
}
