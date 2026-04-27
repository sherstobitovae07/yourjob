"use client";
import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardService } from "@/services/dashboardService";
import type { InternshipCreateRequest, InternshipUpdateRequest } from "@/types/dashboard";
import "@/styles/components/pages/auth/authRegisterPage.css";
interface CreateInternshipPageProps {
  mode?: "create" | "edit";
  internshipId?: number;
  initialData?: {
    title: string;
    description: string;
    city: string;
    direction: string;
    salary: number | undefined;
    deadline: string;
  };
}
export default function CreateInternshipPage({
  mode = "create",
  internshipId,
  initialData,
}: CreateInternshipPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileLabel, setFileLabel] = useState("Файл не выбран");
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (mode === "edit" && initialData) {
      const form = document.querySelector(".auth-form") as HTMLFormElement;
      if (form) {
        const titleInput = form.querySelector("#title") as HTMLInputElement;
        const descriptionInput = form.querySelector("#description") as HTMLTextAreaElement;
        const cityInput = form.querySelector("#city") as HTMLInputElement;
        const directionInput = form.querySelector("#direction") as HTMLInputElement;
        const salaryInput = form.querySelector("#salary") as HTMLInputElement;
        const deadlineInput = form.querySelector("#deadline") as HTMLInputElement;
        if (titleInput) titleInput.value = initialData.title;
        if (descriptionInput) descriptionInput.value = initialData.description;
        if (cityInput) cityInput.value = initialData.city;
        if (directionInput) directionInput.value = initialData.direction;
        if (salaryInput && initialData.salary !== undefined) salaryInput.value = String(initialData.salary);
        if (deadlineInput && initialData.deadline) {
          const date = new Date(initialData.deadline);
          const formattedDate = date.toISOString().split('T')[0];
          deadlineInput.value = formattedDate;
        }
      }
    }
  }, [mode, initialData]);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "");
    const city = String(data.get("city") ?? "").trim();
    const direction = String(data.get("direction") ?? "").trim();
    const salaryRaw = String(data.get("salary") ?? "").trim();
    const salary = salaryRaw === "" ? undefined : Number(salaryRaw);
    const deadlineRaw = String(data.get("deadline") ?? "").trim();
    const deadline = deadlineRaw === "" ? undefined : deadlineRaw;
    const images = Array.from(data.getAll("images") as File[]).filter((file) => file instanceof File && file.size > 0);
    setFileLabel(images.length > 0 ? images.map((file) => file.name).join(", ") : "Файл не выбран");
    if (!title) {
      setError("Название стажировки обязательно");
      return;
    }
    try {
      setLoading(true);
      if (mode === "edit" && internshipId) {
        const payload: InternshipUpdateRequest = {
          title,
          description: description || undefined,
          city: city || undefined,
          direction: direction || undefined,
          salary: salary === undefined || Number.isNaN(salary) ? undefined : salary,
          deadline: deadline || undefined,
        };
        await dashboardService.updateMyInternship(internshipId, payload);
        if (images.length > 0) {
          try {
            for (const file of images) {
              await dashboardService.uploadMyInternshipPhoto(internshipId, file);
            }
          } catch (uploadErr) {
            console.error('Photo upload error (edit):', uploadErr);
            if (axios.isAxiosError(uploadErr) && uploadErr.response) {
              const data = uploadErr.response.data;
              const msg = typeof data === 'string' ? data : JSON.stringify(data);
              setError(`Ошибка загрузки фото: ${msg}`);
            } else {
              setError(uploadErr instanceof Error ? uploadErr.message : 'Ошибка загрузки фото');
            }
            // continue — we already updated main data, but inform user about photo failure
          }
        }
        router.push("/dashboard/employer");
        router.refresh();
      } else {
        const payload = {
          title,
          description: description || undefined,
          city: city || undefined,
          direction: direction || undefined,
          salary: salary === undefined || Number.isNaN(salary) ? undefined : salary,
          deadline: deadline || undefined,
        };
        const created = await dashboardService.createInternship(payload);
        if (images.length > 0 && created && (created as any).id) {
          const createdId = (created as any).id as number;
          try {
            for (const file of images) {
              await dashboardService.uploadMyInternshipPhoto(createdId, file);
            }
          } catch (uploadErr) {
            console.error('Photo upload error (create):', uploadErr);
            if (axios.isAxiosError(uploadErr) && uploadErr.response) {
              const data = uploadErr.response.data;
              const msg = typeof data === 'string' ? data : JSON.stringify(data);
              setError(`Ошибка загрузки фото: ${msg}`);
            } else {
              setError(uploadErr instanceof Error ? uploadErr.message : 'Ошибка загрузки фото');
            }
          }
        }
        router.push("/dashboard/employer");
        router.refresh();
      }
    } catch (err) {
      console.error("Internship save error:", err);
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data;
        const serverMessage = typeof data === 'string' ? data : JSON.stringify(data);
        setError(`Ошибка ${mode === "edit" ? "обновления" : "создания"} стажировки: ${serverMessage}`);
      } else {
        setError(err instanceof Error ? err.message : `Ошибка ${mode === "edit" ? "обновления" : "создания"} стажировки`);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card-side auth-card-side--right">
          <h1 className="auth-title">{mode === "edit" ? "Редактировать стажировку" : "Создать стажировку"}</h1>
          <p className="auth-subtitle">
            {mode === "edit"
              ? "Измените данные стажировки и сохраните изменения."
              : "Заполните форму, чтобы опубликовать стажировку и привлечь лучших стажеров."
            }
          </p>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="full-width">
                <label className="auth-label" htmlFor="title">Название</label>
                <input id="title" name="title" type="text" className="auth-input" placeholder="Пример: Стажировка frontend-разработчика" required disabled={loading} />
              </div>
              <div className="full-width">
                <label className="auth-label" htmlFor="description">Описание</label>
                <textarea
                  id="description"
                  name="description"
                  className="auth-input auth-textarea"
                  rows={6}
                  placeholder="Опишите задачи, требования и условия работы"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="auth-label" htmlFor="city">Город</label>
                <input id="city" name="city" type="text" className="auth-input" placeholder="Пример: Москва" disabled={loading} />
              </div>
              <div>
                <label className="auth-label" htmlFor="direction">Направление</label>
                <input id="direction" name="direction" type="text" className="auth-input" placeholder="Пример: Веб-разработка" disabled={loading} />
              </div>
              <div>
                <label className="auth-label" htmlFor="salary">Зарплата</label>
                <input id="salary" name="salary" type="number" className="auth-input" placeholder="50000" disabled={loading} />
              </div>
              <div>
                <label className="auth-label" htmlFor="deadline">Крайний срок подачи</label>
                <input id="deadline" name="deadline" type="date" className="auth-input" disabled={loading} />
              </div>
              <div className="full-width">
                <label className="auth-label" htmlFor="images">Фотографии стажировки</label>
                <div className="auth-file-wrapper">
                  <div className="auth-file-overlay" />
                  <input
                    id="images"
                    name="images"
                    ref={inputFileRef}
                    type="file"
                    className="auth-file-input"
                    accept="image/*"
                    multiple
                    disabled={loading}
                    onChange={(event) => {
                      const selected = Array.from((event.target as HTMLInputElement).files ?? []);
                      setFileLabel(selected.length > 0 ? selected.map((file) => file.name).join(", ") : "Файл не выбран");
                    }}
                  />
                  <span className="auth-file-text">{fileLabel}</span>
                  <span className="auth-file-icon">+</span>
                </div>
              </div>
              <div className="full-width">
                <button className="auth-button" type="submit" disabled={loading}>
                  {loading ? "Сохранение..." : mode === "edit" ? "Сохранить изменения" : "Сохранить стажировку"}
                </button>
              </div>
            </form>
          </div>
      </section>
    </main>
  );
}
