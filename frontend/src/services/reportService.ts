import { apiClient } from '../configs/axiosClient';
import type {
  PublishedInternshipReportItem,
  StudentCountReportResponse,
  StudentEducationReportResponse,
  EmployerInfoReportResponse,
  ApplicationsByInternshipReportItem,
  StudentApplicationsReportResponse,
  DirectionsPopularityReportResponse,
} from '../types/reports';

const API_BASE = '/reports';

export const reportService = {
  getPublishedInternships: async (): Promise<PublishedInternshipReportItem[]> => {
    const response = await apiClient.get<PublishedInternshipReportItem[]>(
      `${API_BASE}/published-internships`
    );
    return response.data;
  },

  getInternshipsByCity: async (): Promise<any[]> => {
    const response = await apiClient.get(`${API_BASE}/internships-by-city`);
    return response.data;
  },

  getCompaniesAndInternships: async (): Promise<any[]> => {
    const response = await apiClient.get(`${API_BASE}/companies-and-internships`);
    return response.data;
  },

  getApplicationsByInternship: async (): Promise<ApplicationsByInternshipReportItem[]> => {
    const response = await apiClient.get<ApplicationsByInternshipReportItem[]>(
      `${API_BASE}/applications-by-internship`
    );
    return response.data;
  },

  getStudentsCount: async (): Promise<StudentCountReportResponse> => {
    const response = await apiClient.get<StudentCountReportResponse>(`${API_BASE}/students-count`);
    return response.data;
  },

  getStudentsEducation: async (): Promise<StudentEducationReportResponse> => {
    const response = await apiClient.get<StudentEducationReportResponse>(
      `${API_BASE}/students-education`
    );
    return response.data;
  },

  getEmployersInfo: async (): Promise<EmployerInfoReportResponse> => {
    const response = await apiClient.get<EmployerInfoReportResponse>(`${API_BASE}/employers-info`);
    return response.data;
  },

  getStudentApplications: async (): Promise<StudentApplicationsReportResponse> => {
    const response = await apiClient.get<StudentApplicationsReportResponse>(
      `${API_BASE}/student-applications`
    );
    return response.data;
  },

  getDirectionsPopularity: async (): Promise<DirectionsPopularityReportResponse> => {
    const response = await apiClient.get<DirectionsPopularityReportResponse>(
      `${API_BASE}/directions-popularity`
    );
    return response.data;
  },

  downloadPublishedInternshipsPdf: async (): Promise<void> => {
    const response = await apiClient.get(`${API_BASE}/pdf/published-internships`, {
      responseType: 'blob',
    } as any);
    const blob = response.data as Blob;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'internships_report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  downloadInternshipsByCityPdf: async (): Promise<void> => {
    const response = await apiClient.get(`${API_BASE}/pdf/internships-by-city`, {
      responseType: 'blob',
    } as any);
    const blob = response.data as Blob;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'internships_by_city_report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  downloadCompaniesAndInternshipsPdf: async (): Promise<void> => {
    const response = await apiClient.get(`${API_BASE}/pdf/companies-and-internships`, {
      responseType: 'blob',
    } as any);
    const blob = response.data as Blob;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'companies_and_internships_report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  downloadApplicationsByInternshipCsv: async (): Promise<void> => {
    const response = await apiClient.get<ApplicationsByInternshipReportItem[]>(
      `${API_BASE}/applications-by-internship`
    );
    const data = response.data;
    const csv = ['Стажировка,Компания,Приложений'];
    data.forEach((item: any) => {
      csv.push(`"${item.internship_title}","${item.company_name}",${item.applications_count}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'applications_by_internship_report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  downloadStudentsCountCsv: async (): Promise<void> => {
    const response = await apiClient.get<StudentCountReportResponse>(`${API_BASE}/students-count`);
    const data = response.data;
    const csv = ['ФИ'];
    data.students.forEach((item: any) => {
      csv.push(`"${item.full_name}"`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students_count_report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  downloadStudentsEducationCsv: async (): Promise<void> => {
    const response = await apiClient.get<StudentEducationReportResponse>(
      `${API_BASE}/students-education`
    );
    const data = response.data;
    const csv = ['ФИ,ВУЗ'];
    data.students.forEach((item: any) => {
      csv.push(`"${item.full_name}","${item.university || 'Не указано'}"`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students_education_report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  downloadEmployersInfoCsv: async (): Promise<void> => {
    const response = await apiClient.get<EmployerInfoReportResponse>(`${API_BASE}/employers-info`);
    const data = response.data;
    const csv = ['Компания,Стажировок,Приложений'];
    data.employers.forEach((item: any) => {
      csv.push(`"${item.company_name}",${item.internships_count},${item.applications_count}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employers_info_report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  downloadStudentApplicationsCsv: async (): Promise<void> => {
    const response = await apiClient.get<StudentApplicationsReportResponse>(
      `${API_BASE}/student-applications`
    );
    const data = response.data;
    const csv = ['Студент,Стажировка,Компания,Статус'];
    data.applications.forEach((item: any) => {
      csv.push(`"${item.student_full_name}","${item.internship_title}","${item.company_name}","${item.status}"`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_applications_report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  downloadDirectionsPopularityCsv: async (): Promise<void> => {
    const response = await apiClient.get<DirectionsPopularityReportResponse>(
      `${API_BASE}/directions-popularity`
    );
    const data = response.data;
    const csv = ['Направление,Стажировок'];
    data.directions.forEach((item: any) => {
      csv.push(`"${item.direction || 'Без направления'}",${item.internships_count}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'directions_popularity_report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
