"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dashboardService } from '@/services/dashboardService';
import type { InternshipPublicResponse } from '@/types/internship';
import type { ApplicationItem } from '@/types/dashboard';
import { getInternshipImage, parseDateFromString, formatRuDate, formatStatus, getFirstSentence } from '@/utils/internshipUtils';
import InternshipListWithFilters from '@/components/internship/InternshipListWithFilters';
import ArticleList from '@/components/article/ArticleList';
import styles from "@/app/page.module.css";
import StudentDeleteApplicationModal from './StudentDeleteApplicationModal';

type ApplicationWithDetails = ApplicationItem & {
  description?: string | null;
  company_name?: string | null;
  image_url?: string | null;
  direction?: string | null;
  salary?: number | null;
  deadline?: string | null;
  created_at?: string | null;
};

export default function StudentDashboard() {
  const [internships, setInternships] = useState<InternshipPublicResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<"internships" | "applications" | "articles">("internships");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [internshipsData, applicationsData, allArticles] = await Promise.all([
          dashboardService.getActiveInternships(),
          dashboardService.getMyApplications(),
          (await import('@/services/articleService')).articleService.getArticles(),
        ]);

        const applicationsWithDetails = await Promise.all(
          applicationsData.map(async (app) => {
            try {
              const internship = await dashboardService.getPublicInternshipById(app.internship_id);
              return {
                ...app,
                description: internship.description,
                company_name: app.company_name || internship.company_name,
                image_url: (internship as any).image_url,
                direction: internship.direction,
                salary: internship.salary,
                deadline: internship.deadline,
                created_at: internship.created_at,
              };
            } catch {
              return app;
            }
          })
        );

        setInternships(internshipsData);
        setApplications(applicationsWithDetails);
        setArticles(allArticles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDeleteApplication = (applicationId?: number) => {
    if (!applicationId) return;
    setSelectedApplicationId(applicationId);
    setDeleteModalOpen(true);
  };

  const handleDeletedConfirmed = () => {
    if (!selectedApplicationId) return;
    setApplications((prev) => prev.filter((a) => a.id !== selectedApplicationId));
    setSelectedApplicationId(null);
  };

  if (loading) {
    return <div className="student-dashboard loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="student-dashboard error">Ошибка: {error}</div>;
  }

  const publishedCount = (articles || []).filter((a: any) => a.published === true).length;

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.intro}>
          <h1>Найди стажировку мечты</h1>
          <p>Просматривай активные вакансии, подавай заявки и развивай карьеру</p>
        </div>
      </section>

      <div className={styles.roleTabs}>
        <button
          className={`${styles.roleBtn} ${activeTab === "internships" ? styles.roleBtnActive : ""}`}
          onClick={() => setActiveTab("internships")}
        >
          Активные стажировки ({internships.length})
        </button>
        <button
          className={`${styles.roleBtn} ${activeTab === "articles" ? styles.roleBtnActive : ""}`}
          onClick={() => setActiveTab("articles")}
        >
          Статьи ({publishedCount})
        </button>
        <button
          className={`${styles.roleBtn} ${activeTab === "applications" ? styles.roleBtnActive : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          Мои заявки ({applications.length})
        </button>
      </div>

      <section className={styles.internshipsSection}>
        {activeTab === "internships" ? (
          <>
            <InternshipListWithFilters />
          </>
        ) : activeTab === "articles" ? (
          <>
            {/* show articles list (students read all published articles) */}
            <div style={{ marginTop: 8 }}>
              {(() => {
                // only show published articles to students
                const published = (articles || []).filter((a: any) => a.published === true);
                return <ArticleList articles={published} showActions={false} showStatus={false} />;
              })()}
            </div>
          </>
        ) : (
          <>
            {applications.length === 0 ? (
              <p className={styles.emptyState}>Вы не подали ни одной заявки на стажировки.</p>
            ) : (
              <div className={styles.internshipGrid}>
                {applications.map((app) => {
                  const applicationImageUrl = app.image_url ?? getInternshipImage(app.internship_title);
                  return (
                    <article key={app.id} className={styles.internshipCard}>
                      <div className={styles.internshipImage}>
                        {applicationImageUrl ? (
                          <img src={applicationImageUrl} alt={app.internship_title || "Стажировка"} loading="lazy" />
                        ) : (
                          <span className={styles.internshipImageFallback}>изображение отсутствует</span>
                        )}
                      </div>
                      <div className={styles.internshipContent}>
                      <div className={styles.internshipTopRow}>
                        <h3 className={styles.internshipTitle}>{app.internship_title || "Без названия"}</h3>
                        <span className={styles.badge}>{formatStatus(app.status)}</span>
                      </div>
                      <p className={styles.internshipDescription}>{getFirstSentence(app.description) || "Описание отсутствует"}</p>
                      {app.direction && <p className={styles.internshipCategory}>{app.direction}</p>}
                      {app.salary != null && <p className={styles.internshipSalary}>{app.salary} ₽/мес</p>}
                      {app.company_name && <p className={styles.internshipCityUniversity}>{app.company_name}</p>}
                      {app.deadline && (
                        <p className={styles.internshipDeadline}>
                          Крайний срок: {formatRuDate(parseDateFromString(app.deadline)) || app.deadline}
                        </p>
                      )}
                      <p className={styles.internshipPublished}>
                        {app.created_at ? `Опубликовано ${app.created_at.split("T")[0]}` : "Дата публикации не указана"}
                      </p>
                      <div className={styles.internshipCardActions}>
                        <Link
                          href={`/dashboard/internship/${app.internship_id}`}
                          className={`${styles.roleBtn} ${styles.roleBtnActive}`}
                        >
                          Подробнее
                        </Link>
                        <button
                          className={`${styles.roleBtn} ${styles.roleBtnActive}`}
                          onClick={() => handleDeleteApplication(app.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
      <StudentDeleteApplicationModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setSelectedApplicationId(null); }}
        applicationId={selectedApplicationId}
        onDeleted={handleDeletedConfirmed}
      />
    </main>
  );
}
