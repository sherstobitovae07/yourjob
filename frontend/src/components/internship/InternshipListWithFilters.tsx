"use client";
import React, { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboardService";
import type { InternshipPublicResponse } from "@/types/internship";
import styles from "@/app/page.module.css";
import localStyles from "./InternshipListWithFilters.module.css";
import { getInternshipImage, getFirstSentence, parseDateFromString, formatRuDate, formatStatus } from "@/utils/internshipUtils";
import Link from "next/link";

interface Filters {
  q?: string;
  city?: string;
  direction?: string;
  min_salary?: number | null;
  max_salary?: number | null;
}

export default function InternshipListWithFilters({ initialQ = "" }: { initialQ?: string }) {
  const [internships, setInternships] = useState<InternshipPublicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState(initialQ);
  const [city, setCity] = useState("");
  const [direction, setDirection] = useState("");
  const [minSalary, setMinSalary] = useState<string>("");
  const [maxSalary, setMaxSalary] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [modalQ, setModalQ] = useState(q);

  const fetchData = async (filters?: Filters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getActiveInternships(filters);
      setInternships(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    const filters: Filters = {};
    if (q.trim()) filters.q = q.trim();
    if (city.trim()) filters.city = city.trim();
    if (direction.trim()) filters.direction = direction.trim();
    if (minSalary.trim()) filters.min_salary = Number(minSalary);
    if (maxSalary.trim()) filters.max_salary = Number(maxSalary);
    fetchData(filters);
  };

  return (
    <div>
      {showModal && (
        <div className={localStyles.drawerBackdrop}>
          <div className={localStyles.drawer}>
            <div className={localStyles.drawerHeader}>
              <h3 className={localStyles.drawerTitle}>Фильтры</h3>
              <button onClick={() => setShowModal(false)} className={localStyles.closeBtn}>✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              // build filters from modal-local values
              const filters: Filters = {};
              const finalQ = modalQ?.trim();
              if (finalQ) filters.q = finalQ;
              if (city.trim()) filters.city = city.trim();
              if (direction.trim()) filters.direction = direction.trim();
              if (minSalary.trim()) filters.min_salary = Number(minSalary);
              if (maxSalary.trim()) filters.max_salary = Number(maxSalary);
              // sync main search input and fetch
              setQ(finalQ ?? "");
              fetchData(filters);
              setShowModal(false);
            }}>
              <div className={localStyles.inputSpacing}>
                <input type="text" placeholder="Поиск..." value={modalQ} onChange={(e) => setModalQ(e.target.value)} className={localStyles.input} />
              </div>

              <div className={localStyles.inputSpacing}>
                <label className={localStyles.formLabel}>Регион</label>
                <input type="text" placeholder="Поиск региона" value={city} onChange={(e) => setCity(e.target.value)} className={localStyles.input} />
              </div>

              <div className={localStyles.inputSpacing}>
                <label className={localStyles.formLabel}>Профессия</label>
                <input type="text" placeholder="Поиск профессии" value={direction} onChange={(e) => setDirection(e.target.value)} className={localStyles.input} />
              </div>

              <div className={localStyles.salaryStack}>
                <label className={localStyles.formLabel}>Уровень дохода</label>
                <input type="number" placeholder="От" value={minSalary} onChange={(e) => setMinSalary(e.target.value)} className={localStyles.input} />
                <input type="number" placeholder="До" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} className={localStyles.input} />
              </div>
              <div className={localStyles.actions}>
                <button type="button" onClick={() => { setModalQ(''); setCity(''); setDirection(''); setMinSalary(''); setMaxSalary(''); }} className={`${localStyles.resetBtn}`}>
                  Сбросить
                </button>
                <button type="submit" className={localStyles.submitBtn}>Показать вакансии</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              placeholder="Поиск..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') applyFilters(); }}
              className={styles.searchInputCustom}
            />
          <img
            src="/Magnifying-Glass-Square--Streamline-Core-Remix.png"
            alt="search"
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 24, height: 24, opacity: 0.95 }}
          />
        </div>

        <button
          type="button"
          className={styles.roleBtnActive}
          onClick={() => { setModalQ(q); setShowModal(true); }}
          style={{
            height: 42,
            minWidth: 48,
            padding: 8,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
          }}
        >
          <img src="/Horizontal-Slider-2--Streamline-Sharp.svg" alt="filters" style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : error ? (
        <p className="error">Ошибка: {error}</p>
      ) : internships.length === 0 ? (
        <p className={styles.emptyState}>Нет стажировок по заданным фильтрам.</p>
      ) : (
        <div className={styles.internshipGrid}>
          {internships.map((internship) => {
            const imageUrl = internship.image_url ?? getInternshipImage(internship.title);
            const deadlineDate = parseDateFromString(internship.deadline);
            const isExpired = internship.deadline ? (deadlineDate ?? new Date(0)) < new Date() : false;
            const displayStatus = isExpired ? "CLOSED" : internship.status;
            return (
              <article key={internship.id} className={styles.internshipCard}>
                <div className={styles.internshipImage}>
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
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
                  {(internship.city || internship.company_name) && (
                    <p className={styles.internshipCityUniversity}>
                      {internship.city}
                      {internship.city && internship.company_name ? ", " : ""}
                      {internship.company_name}
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
                  <div className={styles.internshipCardActions}>
                    <Link href={`/dashboard/internship/${internship.id}`} className={`${styles.roleBtn} ${styles.roleBtnActive}`}>
                      Подробнее
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
