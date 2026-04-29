'use client';

import React, { useEffect, useState, useMemo } from 'react';
import styles from '@/styles/components/admin.module.css';
import { articleService } from '@/services/articleService';
import { adminService } from '@/services/adminService';
import type { ArticleResponse } from '@/types/article';
import ArticlePreviewModal from '@/components/article/ArticlePreviewModal';
import ArticleConfirmModal from '@/components/article/ArticleConfirmModal';

export const ArticlesList: React.FC = () => {
  const [articles, setArticles] = useState<ArticleResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      // load both pending and published articles so admin can see both
      const [published, pending, users] = await Promise.all([
        articleService.getArticles(),
        articleService.getPendingArticles(),
        adminService.getAllUsers(),
      ]);

      const byId = new Map<number, any>();
      // published items (mark published = true)
      (published || []).forEach((p: any) => {
        byId.set(p.id, { ...p, published: true });
      });
      // pending items (published = false) - ensure they override published if same id
      (pending || []).forEach((p: any) => {
        byId.set(p.id, { ...p, published: false });
      });

      const usersMap = new Map<number, any>();
      (users || []).forEach((u: any) => usersMap.set(u.id, u));

      const combined = Array.from(byId.values()).sort((a: any, b: any) => b.id - a.id);

      // Merge any locally created fallback articles saved by employer client
      try {
        const sessionRaw = sessionStorage.getItem('newArticle');
        if (sessionRaw) {
          const s = JSON.parse(sessionRaw);
          if (s && s.id) {
            if (byId.has(s.id)) {
              const existing = byId.get(s.id);
              byId.set(s.id, { ...existing, ...s, author_name: existing.author_name || s.author_name, author_id: existing.author_id || s.author_id });
            } else {
              byId.set(s.id, s);
            }
          }
        }
      } catch (e) {
        // ignore
      }
      try {
        const localRaw = localStorage.getItem('newArticles');
        if (localRaw) {
          const arr = JSON.parse(localRaw);
          if (Array.isArray(arr)) {
            arr.forEach((s: any) => {
              if (s && s.id) {
                if (byId.has(s.id)) {
                  const existing = byId.get(s.id);
                  byId.set(s.id, { ...existing, ...s, author_name: existing.author_name || s.author_name, author_id: existing.author_id || s.author_id });
                } else {
                  byId.set(s.id, s);
                }
              }
            });
          }
        }
      } catch (e) {
        // ignore
      }

      const combinedAfterLocal = Array.from(byId.values()).sort((a: any, b: any) => b.id - a.id);

      // attach author_name where possible using admin users list or local fallback
      const withAuthors = combinedAfterLocal.map((it: any) => {
        if (!it.author_name && it.author_id && usersMap.has(it.author_id)) {
          const u = usersMap.get(it.author_id);
          return { ...it, author_name: ((u.first_name || '') + ' ' + (u.last_name || '')).trim() || u.email };
        }
        return it;
      });

      try {
        // eslint-disable-next-line no-console
        console.debug('ArticlesList: articles with authors', withAuthors.map((a: any) => ({ id: a.id, author_id: a.author_id, author_name: a.author_name })));
      } catch (e) {
        // ignore
      }

      setArticles(withAuthors || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки статей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    if (!searchTerm) return articles;
    const s = searchTerm.toLowerCase();
    return articles.filter(a => (a.title || '').toLowerCase().includes(s) || (a.author_name || '').toLowerCase().includes(s));
  }, [articles, searchTerm]);

  const [previewArticle, setPreviewArticle] = useState<ArticleResponse | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'publish' | 'delete' | null>(null);
  const [confirmArticleId, setConfirmArticleId] = useState<number | null>(null);

  const handlePublish = (id: number) => {
    setConfirmAction('publish');
    setConfirmArticleId(id);
    setConfirmOpen(true);
  };

  const handleDelete = (id: number) => {
    setConfirmAction('delete');
    setConfirmArticleId(id);
    setConfirmOpen(true);
  };

  if (loading) return <div className={styles.section}>Загрузка статей...</div>;
  if (error) return <div className={styles.section}><div className={styles.errorContainer}>{error}</div></div>;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Статьи на модерацию ({filtered.length})</h3>
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Поиск по заголовку или автору..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 6 }}
        />
      </div>
      <div className={styles.responsive}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>Заголовок</th>
              <th className={styles.tableHeaderCell}>Автор</th>
              <th className={styles.tableHeaderCell}>Статус</th>
              <th className={styles.tableHeaderCell}>Дата</th>
              <th className={styles.tableHeaderCell} style={{ width: 180 }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{item.title}</td>
                <td className={styles.tableCell}>{item.author_name || (item.author_id ? `ID ${item.author_id}` : 'Не указано')}</td>
                <td className={styles.tableCell}>{item.published ? 'Одобрена' : 'На рассмотрении'}</td>
                <td className={`${styles.tableCell} ${styles.tableCellSecondary}`}>{item.created_at ? item.created_at.split('T')[0] : ''}</td>
                <td className={styles.tableCell}>
                  <div className={styles.reportActions}>
                    <button className={styles.reportBtnSecondary} onClick={() => setPreviewArticle(item)}>Просмотреть</button>
                    {!item.published && (
                      <button className={styles.reportBtn} onClick={() => handlePublish(item.id)}>Опубликовать</button>
                    )}
                    <button className={styles.reportBtnDanger} onClick={() => handleDelete(item.id)}>Удалить</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {previewArticle && (
        <ArticlePreviewModal article={previewArticle} onClose={() => setPreviewArticle(null)} />
      )}
      <ArticleConfirmModal
        open={confirmOpen}
        action={confirmAction}
        articleId={confirmArticleId}
        onClose={() => { setConfirmOpen(false); setConfirmAction(null); setConfirmArticleId(null); }}
        onConfirmed={() => { void load(); }}
      />
    </div>
  );
};

export default ArticlesList;

