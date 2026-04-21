'use client';

import { useState } from 'react';
import styles from '@/styles/components/admin.module.css';
import { reportService } from '../../services/reportService';

interface Report {
  id: string;
  label: string;
  description: string;
  pdfHandler: () => Promise<void>;
}

export const ReportsList: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reports: Report[] = [
    {
      id: 'published-internships',
      label: 'Опубликованные стажировки',
      description: 'Список всех опубликованных стажировок с информацией о компании и сроках',
      pdfHandler: reportService.downloadPublishedInternshipsPdf,
    },
    {
      id: 'internships-by-city',
      label: 'Стажировки по городам',
      description: 'Распределение стажировок по городам',
      pdfHandler: reportService.downloadInternshipsByCityPdf,
    },
    {
      id: 'companies-internships',
      label: 'Компании и стажировки',
      description: 'Список компаний с их стажировками',
      pdfHandler: reportService.downloadCompaniesAndInternshipsPdf,
    },
    {
      id: 'applications-by-internship',
      label: 'Приложения по стажировкам',
      description: 'Количество откликов на каждую стажировку',
      pdfHandler: reportService.downloadApplicationsByInternshipCsv,
    },
    {
      id: 'students-count',
      label: 'Количество студентов',
      description: 'Список всех зарегистрированных студентов',
      pdfHandler: reportService.downloadStudentsCountCsv,
    },
    {
      id: 'students-education',
      label: 'Образование студентов',
      description: 'Информация об образовании студентов (ВУз, факультет)',
      pdfHandler: reportService.downloadStudentsEducationCsv,
    },
    {
      id: 'employers-info',
      label: 'Информация о работодателях',
      description: 'Список работодателей с количеством стажировок и откликов',
      pdfHandler: reportService.downloadEmployersInfoCsv,
    },
    {
      id: 'student-applications',
      label: 'Приложения студентов',
      description: 'История откликов студентов на стажировки',
      pdfHandler: reportService.downloadStudentApplicationsCsv,
    },
    {
      id: 'directions-popularity',
      label: 'Популярность направлений',
      description: 'Количество стажировок по каждому направлению',
      pdfHandler: reportService.downloadDirectionsPopularityCsv,
    },
  ];

  const handleDownloadPdf = async (report: Report) => {
    try {
      setLoading(report.id);
      setError(null);
      await report.pdfHandler();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при скачивании отчёта';
      setError(message);
      console.error('Download error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Отчёты (Доступно {reports.length})</h3>

      {error && <div className={styles.errorContainer}>{error}</div>}

      <div className={styles.reportsList}>
        {reports.map((report) => (
          <div key={report.id} className={styles.reportCard}>
            <div className={styles.reportInfo}>
              <h4 className={styles.reportLabel}>{report.label}</h4>
              <p className={styles.reportDescription}>{report.description}</p>
            </div>
            <div className={styles.reportActions}>
              <button
                className={styles.reportBtn}
                onClick={() => handleDownloadPdf(report)}
                disabled={loading !== null}
              >
                {loading === report.id ? 'Загрузка...' : 'Скачать'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
