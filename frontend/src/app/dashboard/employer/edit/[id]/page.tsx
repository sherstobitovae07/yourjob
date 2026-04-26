"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import CreateInternshipPage from "@/components/Dashboard/internship/CreateInternshipPage";
import { dashboardService } from "@/services/dashboardService";
import { getHttpErrorMessage } from "@/utils/errorUtils";
import type { InternshipResponse } from "@/types/dashboard";
export default function EmployerEditPage() {
  const params = useParams();
  const router = useRouter();
  const internshipId = Number(params.id);
  const [internship, setInternship] = useState<InternshipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const loadInternship = async () => {
      if (!internshipId) {
        setError("Неверный идентификатор стажировки");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await dashboardService.getMyInternshipById(internshipId);
        setInternship(data);
      } catch (err) {
        const errorMsg = getHttpErrorMessage(err, "Не удалось загрузить стажировку");
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    loadInternship();
  }, [internshipId]);
  if (loading) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-card-side auth-card-side--right">
            <h1 className="auth-title">Загрузка...</h1>
          </div>
        </section>
      </main>
    );
  }
  const isNotFound = error?.toLowerCase().includes("не найд") || error === "Сущность не найдена.";

  if (isNotFound) {
    notFound();
  }

  if (error || !internship) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-card-side auth-card-side--right">
            <h1 className="auth-title">Ошибка</h1>
            <p className="auth-error">{error || "Произошла ошибка"}</p>
            <button className="auth-button" type="button" onClick={() => router.back()}>
              Вернуться назад
            </button>
          </div>
        </section>
      </main>
    );
  }
  return (
    <CreateInternshipPage
      mode="edit"
      internshipId={internship.id}
      initialData={{
        title: internship.title || "",
        description: internship.description || "",
        city: internship.city || "",
        direction: internship.direction || "",
        salary: internship.salary ?? undefined,
        deadline: internship.deadline || "",
      }}
    />
  );
}
