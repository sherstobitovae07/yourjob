
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { dashboardService } from "../../services/dashboardService";
import ApplicationsModal from "./ApplicationsModal";
import type {
  EmployerProfileData,
  InternshipResponse,
  InternshipPublicResponse,
} from "../../types/dashboard";
import { getInternshipImage, parseDateFromString, formatRuDate, formatStatus, getFirstSentence } from "../../utils/internshipUtils";
import styles from "@/app/page.module.css";
export default function EmployerDashboard() {
  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [activeInternships, setActiveInternships] = useState<InternshipPublicResponse[]>([]);
  const [myInternships, setMyInternships] = useState<InternshipResponse[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "mine">("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInternshipForApps, setSelectedInternshipForApps] = useState<{ id: number; title: string } | null>(null);
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [profileData, activeData, myData] = await Promise.all([
          dashboardService.getEmployerProfile(),
          dashboardService.getActiveInternships(),
          dashboardService.getMyInternships(),
        ]);
        setProfile(profileData);
        setActiveInternships(activeData);
        setMyInternships(myData);
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
          <div style={{ marginTop: "20px", display: "inline-block" }}>
            <Link href="/dashboard/employer/create" className={`${styles.roleBtn} ${styles.roleBtnActive}`} style={{ minWidth: "260px", textAlign: "center" }}>
              + Создать стажировку
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
          className={`${styles.roleBtn} ${!isActiveTab ? styles.roleBtnActive : ""}`}
          onClick={() => setActiveTab("mine")}
        >
          Мои стажировки ({myInternships.length})
        </button>
      </div>
      <section className={styles.internshipsSection}>
        {internships.length === 0 ? (
          <p className={styles.emptyState}>
            {isActiveTab
              ? "Нет активных стажировок на сайте."
              : "Вы ещё не создали ни одной стажировки."}
          </p>
        ) : (
          <div className={styles.internshipGrid}>
            {internships.map((internship) => {
              const companyName = isActiveTab
                ? (internship as InternshipPublicResponse).company_name
                : profile?.company_name;
              const imageUrl = getInternshipImage(internship.title);
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
                    {(internship.city || companyName) && (
                      <p className={styles.internshipCityUniversity}>
                        {internship.city}
                        {internship.city && companyName ? ", " : ""}
                        {companyName}
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
                    {!isActiveTab && (
                      <div className={styles.internshipCardFooter}>
                        <Link
                          href={`/dashboard/employer/edit/${internship.id}`}
                          className={`${styles.roleBtn} ${styles.roleBtnActive} ${styles.employerActionBtn}`}
                        >
                          Редактировать
                        </Link>
                        <button
                          type="button"
                          className={`${styles.roleBtn} ${styles.roleBtnActive} ${styles.employerActionBtn}`}
                          onClick={() => setSelectedInternshipForApps({ id: internship.id, title: internship.title || "Стажировка" })}
                        >
                          Просмотреть заявки
                        </button>
                      </div>
                    )}
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
