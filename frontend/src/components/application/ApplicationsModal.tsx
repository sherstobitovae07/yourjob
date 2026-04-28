"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { dashboardService } from "@/services/dashboardService";
import type { InternshipApplicationResponse } from "@/types/dashboard";
import DeleteApplicationAsEmployerModal from './DeleteApplicationAsEmployerModal';
import ConfirmStatusChangeModal from './ConfirmStatusChangeModal';
import modalStyles from '@/styles/components/modal.module.css';
import styles from '@/styles/components/applications.module.css';
interface ApplicationsModalProps {
  internshipId: number;
  internshipTitle: string;
  onClose: () => void;
}
export default function ApplicationsModal({
  internshipId,
  internshipTitle,
  onClose,
}: ApplicationsModalProps) {
  
  const [applications, setApplications] = useState<InternshipApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState<Record<number, boolean>>({});
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<number | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmTargetStatus, setConfirmTargetStatus] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [confirmApplicationId, setConfirmApplicationId] = useState<number | null>(null);
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getApplicationsByInternship(internshipId);
        setApplications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить заявки");
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [internshipId]);
  const handleStatusChange = async (applicationId: number, newStatus: "APPROVED" | "REJECTED") => {
    try {
      setStatusLoading((prev) => ({ ...prev, [applicationId]: true }));
      setRowErrors((prev) => ({ ...prev, [applicationId]: "" }));
      const updated = await dashboardService.updateApplicationStatus(applicationId, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: updated.status } : app))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось обновить статус";
      setRowErrors((prev) => ({ ...prev, [applicationId]: message }));
    } finally {
      setStatusLoading((prev) => ({ ...prev, [applicationId]: false }));
    }
  };
  const getStatusLabel = (status: string | null) => {
    if (status === "PENDING") return "НА РАССМОТРЕНИИ";
    if (status === "APPROVED") return "ПРИНЯТО";
    if (status === "REJECTED") return "ОТКЛОНЕНО";
    return "НЕ УКАЗАНО";
  };
  const getStatusClassName = (status: string | null) => {
    if (status === "PENDING") return styles.applicationStatusPending || "";
    if (status === "APPROVED") return styles.statusApproved || "";
    if (status === "REJECTED") return styles.statusRejected || "";
    return "";
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}.${date.getFullYear()}`;
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content applications-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Заявки на стажировку: {internshipTitle}</h2>
        {loading ? (
          <div className="modal-loading">
            <p>Загрузка заявок...</p>
          </div>
        ) : error ? (
          <div className="modal-error">
            <p>Ошибка: {error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="modal-empty">
            <p>Нет заявок на эту стажировку</p>
          </div>
        ) : (
          <div className="applications-table-wrapper">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Имя студента</th>
                  <th>Email</th>
                  <th>Статус</th>
                  <th>Дата подачи</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      {app.student_first_name} {app.student_last_name}
                    </td>
                    <td>{app.student_email || "—"}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClassName(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    <td>{formatDate(app.applied_at)}</td>
                    <td>
                      <div className={styles.actionButtonsRow}>
                        <Link
                          href={`/dashboard/student/${app.student_id}?first_name=${encodeURIComponent(app.student_first_name ?? "")}&last_name=${encodeURIComponent(app.student_last_name ?? "")}&email=${encodeURIComponent(app.student_email ?? "")}`}
                          className={styles.profileLinkText}
                          onClick={() => onClose()}
                        >
                          Просмотреть профиль
                        </Link>
                        {(app.status !== "APPROVED" || app.status === null) && (
                          <button
                            className={`${styles.smallRoleBtn} ${styles.smallRoleBtnPrimary}`}
                            type="button"
                            disabled={!!statusLoading[app.id]}
                            onClick={() => {
                              setConfirmApplicationId(app.id);
                              setConfirmTargetStatus('APPROVED');
                              setConfirmModalOpen(true);
                            }}
                          >
                            Принять
                          </button>
                        )}
                        {(app.status !== "REJECTED" || app.status === null) && (
                          <button
                            className={`${styles.smallRoleBtn} ${styles.smallRoleBtnPrimary}`}
                            type="button"
                            disabled={!!statusLoading[app.id]}
                            onClick={() => {
                              setConfirmApplicationId(app.id);
                              setConfirmTargetStatus('REJECTED');
                              setConfirmModalOpen(true);
                            }}
                          >
                            Отклонить
                          </button>
                        )}
                        <button
                          className={`${styles.smallRoleBtn} ${styles.smallRoleBtnDanger}`}
                          type="button"
                          onClick={() => {
                            setSelectedToDelete(app.id);
                            setDeleteModalOpen(true);
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                      {rowErrors[app.id] && <p className="row-error">{rowErrors[app.id]}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <DeleteApplicationAsEmployerModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setSelectedToDelete(null); }}
        applicationId={selectedToDelete}
        onDeleted={() => {
          if (selectedToDelete) setApplications((prev) => prev.filter((a) => a.id !== selectedToDelete));
        }}
      />
      <ConfirmStatusChangeModal
        open={confirmModalOpen}
        onClose={() => { setConfirmModalOpen(false); setConfirmApplicationId(null); setConfirmTargetStatus(null); }}
        applicationId={confirmApplicationId}
        targetStatus={confirmTargetStatus}
        onConfirmed={(updatedStatus) => {
          if (confirmApplicationId && updatedStatus) {
            setApplications((prev) => prev.map((a) => (a.id === confirmApplicationId ? { ...a, status: updatedStatus as InternshipApplicationResponse['status'] } : a)));
            setRowErrors((prev) => ({ ...prev, [confirmApplicationId]: '' }));
          }
          setConfirmModalOpen(false);
          setConfirmApplicationId(null);
          setConfirmTargetStatus(null);
        }}
      />
    </div>
  );
}
