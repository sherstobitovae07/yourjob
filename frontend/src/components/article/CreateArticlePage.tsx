"use client";
import { FormEvent, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { articleService } from "@/services/articleService";
import axios from "axios";
import "@/styles/components/pages/auth/authRegisterPage.css";

export default function CreateArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // no file upload support — backend doesn't provide image endpoint

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const content = String(data.get("content") ?? "").trim();

    if (!title) {
      setError("Название статьи обязательно");
      return;
    }

    try {
      setLoading(true);
      // get current user and employer profile so we can enrich created object if backend doesn't return author
      let currentUser: any = null;
      let employerProfile: any = null;
      try {
        const ds = await import('@/services/dashboardService');
        currentUser = await ds.dashboardService.getCurrentUser();
        try {
          // try to fetch employer profile (contains company_name) — useful when auth/me doesn't include company
          employerProfile = await ds.dashboardService.getEmployerProfile();
        } catch (e) {
          // ignore missing employer profile (e.g., not an employer)
        }
      } catch (e) {
        // ignore
      }
      // debug: log fetched user/profile
      try {
        // eslint-disable-next-line no-console
        console.debug('CreateArticlePage: currentUser, employerProfile', { currentUser, employerProfile });
      } catch (e) {
        // ignore
      }
      const authorNameComputed = currentUser ? ((currentUser.first_name || '') + ' ' + (currentUser.last_name || '')).trim() || (employerProfile?.company_name) || currentUser.company_name || currentUser.email : undefined;

      const created = await articleService.createArticle({ title, content: content || undefined, author_name: authorNameComputed });
      // ensure we have an object to show in employer UI even if backend response lacks author fields
      const local = {
        id: (created && created.id) || -Date.now(),
        title,
        content: content || undefined,
        author_id: created?.author_id ?? currentUser?.id ?? null,
        author_name: created?.author_name ?? (currentUser ? ((currentUser.first_name || '') + ' ' + (currentUser.last_name || '')).trim() || (employerProfile?.company_name) || currentUser.company_name || currentUser.email : undefined),
        published: created?.published ?? false,
        created_at: created?.created_at ?? new Date().toISOString(),
      };
      try {
        sessionStorage.setItem('newArticle', JSON.stringify(local));
        // eslint-disable-next-line no-console
        console.debug('CreateArticlePage: stored session newArticle', local);
      } catch (e) {
        // ignore storage errors
      }
      try {
        const arrRaw = localStorage.getItem('newArticles');
        const arr = arrRaw ? JSON.parse(arrRaw) : [];
        arr.unshift(local);
        // keep only last 10
        localStorage.setItem('newArticles', JSON.stringify(arr.slice(0, 10)));
      // debug: log localArticles
      try {
        // eslint-disable-next-line no-console
        console.debug('CreateArticlePage: updated local newArticles', JSON.parse(localStorage.getItem('newArticles') || '[]'));
      } catch (e) {
        // ignore
      }
      } catch (e) {
        // ignore
      }
      // article created and stored locally for employer UI
      // after successful creation, navigate to employer dashboard
      router.push('/dashboard/employer');
      router.refresh();
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response) {
        setError(typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data));
      } else {
        setError(err instanceof Error ? err.message : "Ошибка при создании статьи");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card-side auth-card-side--right">
          <h1 className="auth-title">Создать статью</h1>
          <p className="auth-subtitle">Напишите статью — она будет отправлена администратору на проверку.</p>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="full-width">
              <label className="auth-label" htmlFor="title">Название</label>
              <input id="title" name="title" type="text" className="auth-input" placeholder="Заголовок статьи" required disabled={loading} />
            </div>
            <div className="full-width">
              <label className="auth-label" htmlFor="content">Текст</label>
              <textarea id="content" name="content" className="auth-input auth-textarea" rows={10} placeholder="Текст статьи" disabled={loading} />
            </div>
            {/* No image upload — backend does not support article images */}
            <div className="full-width">
              <button className="auth-button" type="submit" disabled={loading}>{loading ? "Сохранение..." : "Сохранить статью"}</button>
            </div>
          </form>
          {/* Debug panel removed (temporary debug info suppressed) */}
          {/* After save, user is redirected to employer dashboard */}
        </div>
      </section>
    </main>
  );
}
