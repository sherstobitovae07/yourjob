"use client";
import { useState } from "react";
import { dashboardService } from "@/services/dashboardService";
import type { InternshipPublicResponse, InternshipResponse } from "@/types/dashboard";
import styles from "@/app/page.module.css";
interface InternshipDetailsModalProps {
  internship: InternshipPublicResponse | InternshipResponse;
  isEmployerView?: boolean;
  onClose: () => void;
  onApply?: (internshipId: number) => void;
}
export default function InternshipDetailsModal({
  internship,
  isEmployerView = false,
  onClose,
  onApply,
}: InternshipDetailsModalProps) {
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const handleApply = async () => {
    if (!onApply) return;
    try {
      setApplying(true);
      setApplyError(null);
      await dashboardService.applyToInternship(internship.id);
      onApply(internship.id);
      setApplySuccess("Вы успешно откликнулись на стажировку!");
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Ошибка при отклике");
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
  const isExpired = internship.deadline ? (parseDateFromString(internship.deadline) ?? new Date(0)) < new Date() : false;
  const displayStatus = isExpired ? "CLOSED" : internship.status;
  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
        <h2>{internship.title}</h2>
        {internship.description && (
          <div className="modal-section">
            <h3>Описание</h3>
            <p>{internship.description}</p>
          </div>
        )}
        <div className="modal-details">
          {internship.direction && (
            <div className="modal-detail">
              <strong>Направление:</strong> {internship.direction}
            </div>
          )}
          {internship.city && (
            <div className="modal-detail">
              <strong>Город:</strong> {internship.city}
            </div>
          )}
          {internship.salary != null && (
            <div className="modal-detail">
              <strong>Зарплата:</strong> {internship.salary} ₽/мес
            </div>
          )}
          <div className="modal-detail">
            <strong>Статус:</strong>
            <span className={`status-badge status-${displayStatus?.toLowerCase() ?? "unknown"}`}>
              {displayStatus === "ACTIVE" && "АКТИВНА"}
              {displayStatus === "CLOSED" && "ЗАКРЫТА"}
              {displayStatus === "ARCHIVED" && "В АРХИВЕ"}
              {!displayStatus && "НЕ УКАЗАНО"}
            </span>
          </div>
          <div className="modal-detail">
            <strong>Крайний срок подачи заявок:</strong>
            <span className={isExpired ? "deadline-expired" : "deadline-active"}>
              {formatDate(internship.deadline)}
            </span>
          </div>
          {internship.created_at && (
            <div className="modal-detail">
              <strong>Дата создания:</strong> {formatDate(internship.created_at)}
            </div>
          )}
          {"company_name" in internship && internship.company_name && (
            <div className="modal-detail">
              <strong>Компания:</strong> {internship.company_name}
            </div>
          )}
        </div>
        {!isEmployerView && internship.status === "ACTIVE" && !isExpired && (
          <div className="modal-actions">
            {applyError && <p className="error-message">{applyError}</p>}
            <button
              className={`${styles.roleBtn} ${styles.roleBtnActive}`}
              onClick={handleApply}
              disabled={applying}
            >
              {applying ? "Отправка..." : "Откликнуться"}
            </button>
          </div>
        )}
      </div>
    </div>
      {applySuccess && (
        <div className="modal-overlay modal-success-overlay" onClick={() => setApplySuccess(null)}>
          <div className="modal-content modal-success-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setApplySuccess(null)}>×</button>
            <h2>Отклик отправлен</h2>
            <p className="success-message">{applySuccess}</p>
            <div className="modal-actions">
              <button className={`${styles.roleBtn} ${styles.roleBtnActive}`} onClick={() => setApplySuccess(null)}>
                Продолжить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
