import styles from "./page.module.css";
import type { InternshipPublicResponse } from "@/types/internship";

export const dynamic = "force-dynamic";

async function getActiveInternships(): Promise<InternshipPublicResponse[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";

  const response = await fetch(`${baseUrl}/api/v1/internships`, {
    cache: "no-store",
  });

  if (!response.ok) return [];

  return (await response.json()) as InternshipPublicResponse[];
}

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

export default async function Home() {
  const internships = await getActiveInternships();

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

          {internships.length === 0 ? (
            <p className={styles.emptyState}>
              Пока нет активных стажировок или бэкенд недоступен.
            </p>
          ) : (
            <div className={styles.internshipGrid}>
              {internships.map((item) => {
                const imageUrl = getInternshipImage(item.title);

                return (
                  <article key={item.id} className={styles.internshipCard}>
                    <div className={styles.internshipImage}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.title ?? "Стажировка"}
                          loading="lazy"
                        />
                      ) : (
                        <span className={styles.internshipImageFallback}>
                          изображение отсутствует
                        </span>
                      )}
                    </div>

                    <div className={styles.internshipContent}>
                      <div className={styles.internshipTopRow}>
                        <h3 className={styles.internshipTitle}>
                          {item.title ?? ""}
                        </h3>
                        <span className={styles.badge}>
                          {item.status === "ACTIVE" && "АКТИВНА"}
                          {item.status === "CLOSED" && "ЗАКРЫТА"}
                          {item.status === "ARCHIVED" && "В АРХИВЕ"}
                          {!item.status && "НЕ УКАЗАНО"}
                        </span>
                      </div>
                      {item.description && (
                        <p className={styles.internshipDescription}>
                          {item.description}
                        </p>
                      )}
                      {item.direction && (
                        <p className={styles.internshipCategory}>
                          {item.direction}
                        </p>
                      )}
                      {item.salary != null && (
                        <p className={styles.internshipSalary}>
                          {item.salary} ₽/мес
                        </p>
                      )}
                      {(item.city || item.company_name) && (
                        <p className={styles.internshipCityUniversity}>
                          {item.city}
                          {item.city && item.company_name ? ", " : ""}
                          {item.company_name}
                        </p>
                      )}
                      {item.created_at && (
                        <p className={styles.internshipPublished}>
                          Опубликовано {item.created_at.split("T")[0]}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}