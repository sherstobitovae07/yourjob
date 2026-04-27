import Link from "next/link";
import styles from "./page.module.css";
import type { InternshipPublicResponse } from "@/types/internship";
import InternshipListWithFilters from "@/components/internship/InternshipListWithFilters";

export const dynamic = "force-dynamic";

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

function parseDateFromString(date: string | null) {
  if (!date) return null;
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatRuDate(date: Date | null) {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

function getFirstSentence(text: string | null | undefined): string {
  if (!text) return "";

  const match = text.match(/^[^.!?]*[.!?]/);
  if (match) {
    return match[0].trim();
  }

  return text.trim();
}

export default async function Home() {
  // Active internships are rendered client-side by `InternshipListWithFilters`

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>YourJob</div>

          <div className={styles.authButtons}>
            <a href="/auth" className={styles.loginBtn}>
              Войти
            </a>
            <a href="/auth/register" className={styles.registerBtn}>
              Зарегистрироваться
            </a>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.intro}>
            <h1>Ваш надёжный путь к успешной карьере</h1>
            <p>
              Найдите активные стажировки, откликайтесь и двигайтесь вперед.
            </p>
          </div>
        </section>

        <section className={styles.internshipsSection}>
          <h2 className={styles.sectionTitle}>Активные стажировки</h2>
          <InternshipListWithFilters />
        </section>
      </main>
    </div>
  );
}
