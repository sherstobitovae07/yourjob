
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { dashboardService } from '@/services/dashboardService';
import ApplicationsModal from '@/components/application/ApplicationsModal';
import ArticleList from '@/components/article/ArticleList';
import type { EmployerProfileData, InternshipResponse, InternshipPublicResponse } from '@/types/dashboard';
import { getInternshipImage, parseDateFromString, formatRuDate, formatStatus, getFirstSentence } from '@/utils/internshipUtils';
import InternshipListWithFilters from '@/components/internship/InternshipListWithFilters';
import styles from "@/app/page.module.css";
export default function EmployerDashboard() {
  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [activeInternships, setActiveInternships] = useState<InternshipPublicResponse[]>([]);
  const [myInternships, setMyInternships] = useState<InternshipResponse[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "mine" | "articles">("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInternshipForApps, setSelectedInternshipForApps] = useState<{ id: number; title: string } | null>(null);
  const [myArticles, setMyArticles] = useState<any[]>([]);
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [profileData, activeData, myData, currentUser] = await Promise.all([
          dashboardService.getEmployerProfile(),
          dashboardService.getActiveInternships(),
          dashboardService.getMyInternships(),
          dashboardService.getCurrentUser(),
        ]);

        // fetch published articles always. Only request pending list when user is admin.
        const articleSvc = await import('@/services/articleService');
        const published = await articleSvc.articleService.getArticles();
        let pending: any[] = [];
        try {
          pending = await articleSvc.articleService.getPendingArticles();
        } catch (e) {
          // If backend returns error, ignore and fall back to empty array
          // eslint-disable-next-line no-console
          console.debug('EmployerDashboard: could not load pending articles, falling back', e);
          pending = [];
        }

        try {
          // eslint-disable-next-line no-console
          console.debug('EmployerDashboard: loaded articles', { publishedCount: (published || []).length, pendingCount: (pending || []).length });
          // eslint-disable-next-line no-console
          console.debug('EmployerDashboard: currentUser', currentUser);
        } catch (e) {
          // ignore
        }
        setProfile(profileData);
        setActiveInternships(activeData);
        setMyInternships(myData);
        const byId = new Map<number, any>();
        (published || []).forEach((p: any) => byId.set(p.id, { ...p, published: true }));
        (pending || []).forEach((p: any) => byId.set(p.id, { ...p, published: false }));

        const combined = Array.from(byId.values()).sort((a: any, b: any) => b.id - a.id);

        const my = (combined || []).filter((a: any) => a.author_id === currentUser.id);
        // also check sessionStorage for newly created article (in case backend GET excludes pending)
        try {
          // sessionStorage single-item fallback
          const pendingRaw = sessionStorage.getItem('newArticle');
          // eslint-disable-next-line no-console
          console.debug('EmployerDashboard: session newArticle raw', pendingRaw);
          if (pendingRaw) {
            const pending = JSON.parse(pendingRaw);
            if (pending && !my.find((x: any) => x.id === pending.id)) my.unshift(pending);
            sessionStorage.removeItem('newArticle');
          }
        } catch (e) {
          // ignore
        }
        try {
          // localStorage array fallback for persisted pending items
          const arrRaw = localStorage.getItem('newArticles');
          // eslint-disable-next-line no-console
          console.debug('EmployerDashboard: local newArticles raw', arrRaw);
          if (arrRaw) {
            const arr = JSON.parse(arrRaw);
            if (Array.isArray(arr)) {
              arr.forEach((pending: any) => {
                if (pending && !my.find((x: any) => x.id === pending.id)) my.unshift(pending);
              });
              // clear after consuming
              localStorage.removeItem('newArticles');
            }
          }
        } catch (e) {
          // ignore
        }
        // eslint-disable-next-line no-console
        console.debug('EmployerDashboard: myArticles count after merge', my.length, my.slice(0,5));
        setMyArticles(my);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  if (loading) {
    return <div className="employer-dashboard loading">Загрузка...</div>;
  }
  if (error) {
    return <div className="employer-dashboard error">Ошибка: {error}</div>;
  }
  const isActiveTab = activeTab === "active";
  const internships = isActiveTab ? activeInternships : myInternships;
  return (
    <main className={`${styles.main} dashboard-page`}>
      <section className={styles.hero}>
        <div className={styles.intro}>
          <h1>Добро пожаловать, работодатель!</h1>
          <p>Создавайте стажировки и находите лучших кандидатов для своей команды.</p>
          <div style={{ marginTop: "20px", display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link href="/dashboard/employer/create" className={`${styles.roleBtn} ${styles.roleBtnActive}`} style={{ minWidth: "260px", textAlign: "center" }}>
              + Создать стажировку
            </Link>
            <Link href="/dashboard/employer/create-article" className={`${styles.roleBtn} ${styles.roleBtnActive}`} style={{ minWidth: "260px", textAlign: "center" }}>
              + Создать статью
            </Link>
          </div>
        </div>
      </section>
      <div className={styles.roleTabs}>
        <button
          className={`${styles.roleBtn} ${isActiveTab ? styles.roleBtnActive : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Активные стажировки ({activeInternships.length})
        </button>
        <button
          className={`${styles.roleBtn} ${activeTab === "mine" ? styles.roleBtnActive : ""}`}
          onClick={() => setActiveTab("mine")}
        >
          Мои стажировки ({myInternships.length})
        </button>
        <button
          className={`${styles.roleBtn} ${activeTab === "articles" ? styles.roleBtnActive : ""}`}
          onClick={() => setActiveTab("articles")}
        >
          Мои статьи ({myArticles.length})
        </button>
      </div>
      <section className={styles.internshipsSection}>
        {isActiveTab ? (
          <InternshipListWithFilters />
        ) : activeTab === "mine" ? (
          (myInternships.length === 0 ? (
            <p className={styles.emptyState}>Вы ещё не создали ни одной стажировки.</p>
          ) : (
            <div className={styles.internshipGrid}>
              {myInternships.map((internship) => {
                const imageUrl = (internship as any).image_url ?? getInternshipImage(internship.title);
                const deadlineDate = parseDateFromString(internship.deadline || null);
                const isExpired = deadlineDate ? deadlineDate < new Date() : false;
                const displayStatus = isExpired ? "CLOSED" : internship.status;
                return (
                  <article key={internship.id} className={styles.internshipCard}>
                    <div className={styles.internshipImage}>
                      {imageUrl ? (
                        <img src={imageUrl} alt={internship.title || "Стажировка"} loading="lazy" />
                      ) : (
                        <span className={styles.internshipImageFallback}>изображение отсутствует</span>
                      )}
                    </div>
                    <div className={styles.internshipContent}>
                      <div className={styles.internshipTopRow}>
                        <h3 className={styles.internshipTitle}>{internship.title || "Без названия"}</h3>
                        <span className={styles.badge}>{formatStatus(displayStatus)}</span>
                      </div>
                      <p className={styles.internshipDescription}>{getFirstSentence(internship.description) || "Описание отсутствует"}</p>
                      {internship.direction && <p className={styles.internshipCategory}>{internship.direction}</p>}
                      {internship.salary != null && <p className={styles.internshipSalary}>{internship.salary} ₽/мес</p>}
                      {(internship.city || profile?.company_name) && (
                        <p className={styles.internshipCityUniversity}>
                          {internship.city}
                          {internship.city && profile?.company_name ? ", " : ""}
                          {profile?.company_name}
                        </p>
                      )}
                      {internship.deadline && (
                        <p className={styles.internshipDeadline}>
                          Крайний срок: {formatRuDate(parseDateFromString(internship.deadline)) || internship.deadline}
                        </p>
                      )}
                      <p className={styles.internshipPublished}>
                        {internship.created_at ? `Опубликовано ${internship.created_at.split("T")[0]}` : "Дата публикации не указана"}
                      </p>
                      <div className={styles.internshipCardFooter}>
                        <button
                          type="button"
                          className={`${styles.roleBtn} ${styles.roleBtnActive} ${styles.employerActionBtn}`}
                          onClick={() => setSelectedInternshipForApps({ id: internship.id, title: internship.title || "Стажировка" })}
                        >
                          Просмотреть заявки
                        </button>
                      </div>
                      <div className={styles.internshipCardActions}>
                        <Link
                          href={`/dashboard/internship/${internship.id}`}
                          className={`${styles.roleBtn} ${styles.roleBtnActive} ${styles.employerActionBtn}`}
                        >
                          Подробнее
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            ))
          ) : (
            // articles tab
            <div style={{ marginTop: 8 }}>
              <ArticleList articles={myArticles} showActions={false} />
            </div>
          )}
      </section>
      {selectedInternshipForApps && (
        <ApplicationsModal
          internshipId={selectedInternshipForApps.id}
          internshipTitle={selectedInternshipForApps.title}
          onClose={() => setSelectedInternshipForApps(null)}
        />
      )}
      
    </main>
  );
}
