export type InternshipStatus = "ACTIVE" | "CLOSED" | "ARCHIVED";

/**
 * Соответствует `InternshipPublicResponse` на бэкенде:
 * `GET /api/v1/internships/{internship_id}` и `GET /api/v1/internships`.
 */
export type InternshipPublicResponse = {
  id: number;
  title: string | null;
  description: string | null;
  city: string | null;
  direction: string | null;
  salary: number | null;
  status: InternshipStatus | null;
  deadline: string | null; // JSON date => строка (например "2026-03-23")
  created_at: string | null; // JSON timestamp => строка
  company_name: string | null;
};

