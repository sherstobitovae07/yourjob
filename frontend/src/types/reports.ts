export interface PublishedInternshipReportItem {
  id: number;
  title: string | null;
  company_name: string | null;
  city: string | null;
  direction: string | null;
  salary: number | null;
  status: string | null;
  deadline: string | null;
  created_at: string | null;
}

export interface StudentCountItem {
  id: number;
  full_name: string;
}

export interface StudentCountReportResponse {
  total_students: number;
  students: StudentCountItem[];
}

export interface StudentEducationItem {
  id: number;
  full_name: string;
  university: string | null;
}

export interface StudentEducationReportResponse {
  total_students: number;
  students: StudentEducationItem[];
}

export interface EmployerInfoItem {
  employer_id: number;
  company_name: string | null;
  internships_count: number;
  applications_count: number;
}

export interface EmployerInfoReportResponse {
  total_employers: number;
  employers: EmployerInfoItem[];
}

export interface ApplicationsByInternshipReportItem {
  internship_id: number;
  internship_title: string | null;
  company_name: string | null;
  applications_count: number;
}

export interface StudentApplicationReportItem {
  application_id: number;
  student_id: number;
  student_full_name: string;
  internship_title: string | null;
  company_name: string | null;
  applied_at: string | null;
  status: string | null;
}

export interface StudentApplicationsReportResponse {
  total_applications: number;
  applications: StudentApplicationReportItem[];
}

export interface DirectionPopularityItem {
  direction: string | null;
  internships_count: number;
}

export interface DirectionsPopularityReportResponse {
  directions: DirectionPopularityItem[];
}
