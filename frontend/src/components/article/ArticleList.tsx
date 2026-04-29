"use client";
import React, { useState } from "react";
import styles from "@/app/page.module.css";
import type { ArticleResponse } from '@/types/article';
import ArticlePreviewModal from '@/components/article/ArticlePreviewModal';

interface Props {
  articles: ArticleResponse[];
  onDelete?: (id: number) => Promise<void> | void;
  onPublish?: (id: number) => Promise<void> | void;
  showActions?: boolean;
  showStatus?: boolean;
}

export default function ArticleList({ articles, onDelete, onPublish, showActions = false, showStatus = true }: Props) {
  const [previewArticle, setPreviewArticle] = useState<ArticleResponse | null>(null);
  if (!articles || articles.length === 0) {
    return <p className={styles.emptyState}>Статей пока нет.</p>;
  }

  return (
    <div className={styles.internshipGrid}>
      {articles.map((a) => (
        <article key={a.id} className={styles.internshipCard}>
          <div style={{ padding: 20, flex: 1 }}>
            <div className={styles.internshipTopRow}>
              <h3 className={styles.internshipTitle}>{a.title}</h3>
              {showStatus && <span className={styles.badge}>{a.published ? 'Одобрена' : 'На рассмотрении'}</span>}
            </div>
            <p style={{ color: '#334155', marginTop: 8 }}>{(a.content || '').slice(0, 300)}{(a.content || '').length > 300 ? '...' : ''}</p>
            <p className={styles.articleAuthor}>{a.author_name || 'Автор неизвестен'} — {a.created_at ? a.created_at.split('T')[0] : ''}</p>
          </div>
          <div className={styles.internshipCardActions}>
            <button
              className={`${styles.roleBtn} ${styles.roleBtnActive}`}
              style={{ minWidth: 140 }}
              onClick={() => setPreviewArticle(a)}
            >
              Подробнее
            </button>
            {showActions && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {!a.published && onPublish && (
                  <button className={styles.smallRoleBtnPrimary} onClick={() => onPublish && onPublish(a.id)}>Опубликовать</button>
                )}
                {onDelete && (
                  <button className={styles.smallRoleBtnDanger} onClick={() => onDelete && onDelete(a.id)}>Удалить</button>
                )}
              </div>
            )}
          </div>
        </article>
      ))}
      {previewArticle && (
        <ArticlePreviewModal article={previewArticle} onClose={() => setPreviewArticle(null)} />
      )}
    </div>
  );
}
