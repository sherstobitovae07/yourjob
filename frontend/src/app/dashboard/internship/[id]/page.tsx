"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { dashboardService } from "../../../../services/dashboardService";
import { getHttpErrorMessage } from "../../../../utils/errorUtils";
import type { InternshipPublicResponse } from "../../../../types/dashboard";
import styles from "@/app/page.module.css";
function getInternshipImage(title: string | null) {
  if (
    title?.includes("организации мероприятий") ||
    title?.includes("Event") ||
    title?.includes("мероприятий")
  ) {
    return "/218c9170682e8d1ec7c3a10d28e21663.webp";
  }
  if (
    title?.includes("Логистик") ||
    title?.includes("Supply Chain") ||
    title?.includes("поставок")
  ) {
    return "/logistika-ecommerce-tehnologii-ii-optimizaciya-protsessov.jpg";
  }
  if (
    title?.includes("HR") ||
    title?.includes("рекрутинг") ||
    title?.includes("HR-менеджер")
  ) {
    return "/1794_min.jpg";
  }
  if (
    title?.includes("Финансов") ||
    title?.includes("Financial") ||
    title?.includes("аналитик")
  ) {
    return "/aaxfo4qgf6plgcbknpu13xkuon6dd8qd.jpg";
  }
  if (
    title?.includes("Digital") ||
    title?.includes("маркет") ||
    title?.includes("Marketing")
  ) {
    return "/iStock-1332570157.jpg";
  }
  if (title?.includes("Backend") || title?.includes("Backend-разработчик")) {
    return "/backend-developer.jpeg";
  }
  return null;
}
export default function InternshipDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const internshipId = Number(params.id);
  const [internship, setInternship] = useState<InternshipPublicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"STUDENT" | "EMPLOYER" | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await dashboardService.getCurrentUser();
        setUserRole(currentUser.role as "STUDENT" | "EMPLOYER");
        localStorage.setItem("user_role", currentUser.role);
        setAuthChecked(true);
      } catch {
        setAuthChecked(true);
        router.replace("/auth");
      }
    };
    checkAuth();
  }, [router]);
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const internshipData = await dashboardService.getPublicInternshipById(internshipId);
        setInternship(internshipData);
        if (userRole === "STUDENT") {
          const applications = await dashboardService.getMyApplications();
          setHasApplied(applications.some((app) => app.internship_id === internshipId));
        }
      } catch (err) {
        setError(getHttpErrorMessage(err, "Не удалось загрузить данные стажировки"));
      } finally {
        setLoading(false);
      }
    };
    if (internshipId && authChecked && userRole) {
      loadData();
    }
  }, [internshipId, authChecked, userRole]);
  const handleApply = async () => {
    if (!internship) return;
    if (userRole !== "STUDENT") {
      const confirmLogin = window.confirm("Откликаться могут только студенты. Перейти на страницу входа?");
      if (confirmLogin) {
        router.push("/auth");
      }
      return;
    }
    if (hasApplied) {
      setApplyError("Вы уже откликнулись на эту стажировку");
      return;
    }
    try {
      setApplying(true);
      setApplyError(null);
      await dashboardService.applyToInternship(internship.id);
      setHasApplied(true);
      setApplySuccess("Вы успешно откликнулись на стажировку!");
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      const message =
        error?.response?.data?.detail ||
        (err instanceof Error ? err.message : "Ошибка при отклике");
      setApplyError(message);
    } finally {
      setApplying(false);
    }
  };
  const parseDateFromString = (date: string | null) => {
    if (!date) return null;
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
  const formatDate = (date: string | null) => {
    const parsed = parseDateFromString(date);
    if (!parsed) return "Не указан";
    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}.${parsed.getFullYear()}`;
  };
  const isExpired = internship?.deadline ? (parseDateFromString(internship.deadline) ?? new Date(0)) < new Date() : false;
  const displayStatus = isExpired ? "CLOSED" : internship?.status;
  const statusLabel = displayStatus === "ACTIVE"
    ? "АКТИВНА"
    : displayStatus === "CLOSED"
    ? "ЗАКРЫТА"
    : displayStatus === "ARCHIVED"
    ? "В АРХИВЕ"
    : "НЕ УКАЗАНО";
  const statusClassName = displayStatus ? `status-${displayStatus.toLowerCase()}` : "";
  if (!authChecked) {
    return (
      <main className={styles.main}>
        <div className="loading-container">
          <p>Проверка доступа...</p>
        </div>
      </main>
    );
  }
  if (loading) {
    return (
      <main className={styles.main}>
        <div className="loading-container">
          <p>Загрузка деталей стажировки...</p>
        </div>
      </main>
    );
  }
  const isNotFoundError = error?.toLowerCase().includes("не найд") || error === "Сущность не найдена.";

  if (isNotFoundError) {
    notFound();
  }

  if (error) {
    return (
      <main className={styles.main}>
        <div className="error-container">
          <h1>Ошибка</h1>
          <p>
            {error || "Произошла ошибка при загрузке данных. Попробуйте ещё раз позже."}
          </p>
          <div className="internship-navigation">
            <Link href="/dashboard" className={`${styles.roleBtn} ${styles.roleBtnActive}`}>
              Вернуться к дашборду
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!internship) {
    notFound();
  }
  const imageUrl = getInternshipImage(internship.title);
  return (
    <main className={styles.main} style={{ paddingTop: "60px" }}>
      <div className="internship-container">
        <h1 className="internship-title">{internship.title}</h1>
        <div className="internship-white-container">
          <div className="internship-status-row">
            <span className={`status-badge ${statusClassName}`}>
              {statusLabel}
            </span>
          </div>
          <div className="internship-image-wrap">
            <div className="internship-image-frame">
              {imageUrl ? (
                <img src={imageUrl} alt={internship.title ?? "Стажировка"} className="internship-detail-main-image" />
              ) : (
                <div className="internship-image-placeholder">
                  <span>Изображение отсутствует</span>
                </div>
              )}
            </div>
          </div>
          {internship.salary != null && (
            <div className="internship-salary">
              <span>от {internship.salary} рублей за месяц</span>
            </div>
          )}
          <div className="internship-cta-green">
            Не упустите шанс быть среди первых — откликнитесь прямо сейчас, и начните свой путь в профессии!
          </div>
          <div className="internship-cta-green">
            На данный момент {internship.applications_count} человек откликнулись на стажировку
          </div>
          {internship.created_at && (
            <div className="internship-info">Дата публикации: {formatDate(internship.created_at)}</div>
          )}
          {internship.deadline && (
            <div className="internship-info">Крайний срок подачи заявки: {formatDate(internship.deadline)}</div>
          )}
          {internship.company_name && <div className="internship-info">Работодатель: {internship.company_name}</div>}
          {internship.city && <div className="internship-info">Город: {internship.city}</div>}
          {internship.direction && <div className="internship-info">Направление: {internship.direction}</div>}
          {internship.description && <div className="internship-info">Описание: {internship.description}</div>}
          {internship.status === "ACTIVE" && !isExpired ? (
            <div className="internship-actions">
              {applyError && <p className="error-message">{applyError}</p>}
              {userRole === "STUDENT" ? (
                hasApplied ? (
                  <button className={`${styles.roleBtn} internship-action-btn`} disabled>Вы уже откликнулись на стажировку</button>
                ) : (
                  <button className={`${styles.roleBtn} ${styles.roleBtnActive} internship-action-btn`} onClick={handleApply} disabled={applying}>
                    {applying ? "Отправка..." : "Откликнуться на стажировку"}
                  </button>
                )
              ) : userRole === "EMPLOYER" ? (
                <p className="internship-status-info">Вы являетесь работодателем. Только студенты могут откликаться на эту стажировку.</p>
              ) : (
                <button className={`${styles.roleBtn} ${styles.roleBtnActive} internship-action-btn`} onClick={() => router.push("/auth")}>Войти, чтобы откликнуться</button>
              )}
            </div>
          ) : (
            <p className="internship-status-info">Заявки на эту стажировку в данный момент недоступны</p>
          )}
          <div className="internship-navigation">
            <button
              className={`${styles.roleBtn} internship-back-btn`}
              onClick={() => router.back()}
            >
              Вернуться к списку стажировок 
            </button>
          </div>
        </div>
      </div>
      {applySuccess && (
        <div className="modal-overlay modal-success-overlay" onClick={() => setApplySuccess(null)}>
          <div className="modal-content modal-success-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setApplySuccess(null)}>
              ×
            </button>
            <h2>Отклик отправлен</h2>
            <p className="success-message">{applySuccess}</p>
            <div className="modal-actions">
              <button
                className={`${styles.roleBtn} ${styles.roleBtnActive}`}
                onClick={() => setApplySuccess(null)}
              >
                Продолжить
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
