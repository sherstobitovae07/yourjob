from datetime import date, datetime

from pydantic import BaseModel

from app.models.enums import InternshipStatus


class PublishedInternshipReportItem(BaseModel):
    id: int
    title: str | None = None
    company_name: str | None = None
    city: str | None = None
    direction: str | None = None
    salary: int | None = None
    status: InternshipStatus | None = None
    deadline: date | None = None
    created_at: datetime | None = None


class InternshipShortReportItem(BaseModel):
    id: int
    title: str | None = None
    status: InternshipStatus | None = None


class InternshipsByCityReportItem(BaseModel):
    city: str | None = None
    internships: list[InternshipShortReportItem]


class CompanyInternshipReportItem(BaseModel):
    id: int
    title: str | None = None
    city: str | None = None
    direction: str | None = None
    status: InternshipStatus | None = None


class CompaniesAndInternshipsReportItem(BaseModel):
    employer_id: int
    company_name: str | None = None
    internships: list[CompanyInternshipReportItem]


class ApplicationsByInternshipReportItem(BaseModel):
    internship_id: int
    internship_title: str | None = None
    company_name: str | None = None
    applications_count: int

class StudentCountItem(BaseModel):
    id: int
    full_name: str


class StudentCountReportResponse(BaseModel):
    total_students: int
    students: list[StudentCountItem]

class StudentEducationItem(BaseModel):
    id: int
    full_name: str
    university: str | None = None


class StudentEducationReportResponse(BaseModel):
    total_students: int
    students: list[StudentEducationItem]


class EmployerInfoItem(BaseModel):
    employer_id: int
    company_name: str | None = None
    internships_count: int
    applications_count: int


class EmployerInfoReportResponse(BaseModel):
    total_employers: int
    employers: list[EmployerInfoItem]


class StudentApplicationReportItem(BaseModel):
    application_id: int
    student_id: int
    student_full_name: str
    internship_title: str | None = None
    company_name: str | None = None
    applied_at: datetime | None = None
    status: str | None = None


class StudentApplicationsReportResponse(BaseModel):
    total_applications: int
    applications: list[StudentApplicationReportItem]


class DirectionPopularityItem(BaseModel):
    direction: str | None = None
    internships_count: int
    applications_count: int
    average_applications_per_internship: float


class PopularCityItem(BaseModel):
    city: str | None = None
    internships_count: int


class DirectionsPopularityReportResponse(BaseModel):
    directions: list[DirectionPopularityItem]
    most_popular_cities: list[PopularCityItem]