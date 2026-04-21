"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dashboardService } from "../../services/dashboardService";
import type { InternshipPublicResponse } from "../../types/internship";
import type { ApplicationItem } from "../../types/dashboard";
import { getInternshipImage, parseDateFromString, formatRuDate, formatStatus, getFirstSentence } from "../../utils/internshipUtils";
import styles from "@/app/page.module.css";

type ApplicationWithDetails = ApplicationItem & { description?: string | null };

export default function StudentDashboard() {
  const [internships, setInternships] = useState<InternshipPublicResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<"internships" | "applications">("internships");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [internshipsData, applicationsData] = await Promise.all([
          dashboardService.getActiveInternships(),
          dashboardService.getMyApplications(),
        ]);

        const applicationsWithDetails = await Promise.all(
          applicationsData.map(async (app) => {
            try {
              const internship = await dashboardService.getPublicInternshipById(app.internship_id);
              return {
                ...app,
                description: internship.description,
                company_name: app.company_name || internship.company_name,
              };
            } catch {
              return app;
            }
          })
        );

        setInternships(internshipsData);
        setApplications(applicationsWithDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : "�� ������� ��������� ������");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="student-dashboard loading">��������...</div>;
  }

  if (error) {
    return <div className="student-dashboard error">������: {error}</div>;
  }

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
          className={`${styles.roleBtn} ${activeTab === "applications" ? styles.roleBtnActive : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          Мои заявки ({applications.length})
        </button>
      </div>

      <section className={styles.internshipsSection}>
        {activeTab === "internships" ? (
          <>
            {internships.length === 0 ? (
              <p className={styles.emptyState}>Нет активных стажировок для вашего региона.</p>
            ) : (
              <div className={styles.internshipGrid}>
                {internships.map((internship) => {
                  const internshipImageUrl = internship.image_url ?? getInternshipImage(internship.title);
                  return (
                    <article key={internship.id} className={styles.internshipCard}>
                      <div className={styles.internshipImage}>
                        {internshipImageUrl ? (
                          <img src={internshipImageUrl} alt={internship.title || "Стажировка"} loading="lazy" />
                        ) : (
                          <span className={styles.internshipImageFallback}>изображение отсутствует</span>
                        )}
                      </div>
                      <div className={styles.internshipContent}>
                      <div className={styles.internshipTopRow}>
                        <h3 className={styles.internshipTitle}>{internship.title || "Без названия"}</h3>
                        <span className={styles.badge}>{formatStatus(internship.status)}</span>
                      </div>
                      <p className={styles.internshipDescription}>{getFirstSentence(internship.description) || "Описание отсутствует"}</p>
                      {internship.direction && <p className={styles.internshipCategory}>{internship.direction}</p>}
                      {internship.salary != null && <p className={styles.internshipSalary}>{internship.salary} ₽/мес</p>}
                      {internship.company_name && <p className={styles.internshipCityUniversity}>{internship.company_name}</p>}
                      {internship.deadline && (
                        <p className={styles.internshipDeadline}>
                          Крайний срок: {formatRuDate(parseDateFromString(internship.deadline)) || internship.deadline}
                        </p>
                      )}
                      {internship.created_at && (
                        <p className={styles.internshipPublished}>
                          Опубликовано {internship.created_at.split("T")[0]}
                        </p>
                      )}
                      <div className={styles.internshipCardActions}>
                        <Link
                          href={`/dashboard/internship/${internship.id}`}
                          className={`${styles.roleBtn} ${styles.roleBtnActive}`}
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
                      {app.company_name && <p className={styles.internshipCityUniversity}>{app.company_name}</p>}
                      <div className={styles.internshipCardActions}>
                        <Link
                          href={`/dashboard/internship/${app.internship_id}`}
                          className={`${styles.roleBtn} ${styles.roleBtnActive}`}
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
          </>
        )}
      </section>
    </main>
  );
}
