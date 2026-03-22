from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.user import User
from app.repositories.report_repository import ReportRepository
from app.schemas.report import (
    ApplicationsByInternshipReportItem,
    CompaniesAndInternshipsReportItem,
    CompanyInternshipReportItem,
    DirectionPopularityItem,
    DirectionsPopularityReportResponse,
    EmployerInfoItem,
    EmployerInfoReportResponse,
    InternshipShortReportItem,
    InternshipsByCityReportItem,
    PopularCityItem,
    PublishedInternshipReportItem,
    StudentApplicationReportItem,
    StudentApplicationsReportResponse,
    StudentCountItem,
    StudentCountReportResponse,
    StudentEducationItem,
    StudentEducationReportResponse,
)
from app.schemas.report import StudentCountItem, StudentCountReportResponse
from app.services.pdf_service import PDFService
from app.services.pdf_service import PDFService

class ReportService:
    def __init__(self, db: Session):
        self.repository = ReportRepository(db)

    def _check_admin_access(self, current_user: User) -> None:
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Доступ только для администратора",
            )

        admin = self.repository.get_admin_by_user_id(current_user.id)
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Профиль администратора не найден",
            )

    def get_published_internships_report(
        self,
        current_user: User,
    ) -> list[PublishedInternshipReportItem]:
        self._check_admin_access(current_user)

        internships = self.repository.get_all_internships()
        result = []

        for item in internships:
            company_name = None
            if item.employer:
                company_name = item.employer.company_name

            result.append(
                PublishedInternshipReportItem(
                    id=item.id,
                    title=item.title,
                    company_name=company_name,
                    city=item.city,
                    direction=item.direction,
                    salary=item.salary,
                    status=item.status,
                    deadline=item.deadline,
                    created_at=item.created_at,
                )
            )

        return result

    def get_internships_by_city_report(
        self,
        current_user: User,
    ) -> list[InternshipsByCityReportItem]:
        self._check_admin_access(current_user)

        internships = self.repository.get_all_internships()

        grouped: dict[str | None, list[InternshipShortReportItem]] = {}

        for item in internships:
            city = item.city
            if city not in grouped:
                grouped[city] = []

            grouped[city].append(
                InternshipShortReportItem(
                    id=item.id,
                    title=item.title,
                    status=item.status,
                )
            )

        result = []
        for city, city_internships in grouped.items():
            result.append(
                InternshipsByCityReportItem(
                    city=city,
                    internships=city_internships,
                )
            )

        return result

    def get_companies_and_internships_report(
        self,
        current_user: User,
    ) -> list[CompaniesAndInternshipsReportItem]:
        self._check_admin_access(current_user)

        employers = self.repository.get_all_employers_with_internships()
        result = []

        for employer in employers:
            internships = []
            for internship in employer.internships:
                internships.append(
                    CompanyInternshipReportItem(
                        id=internship.id,
                        title=internship.title,
                        city=internship.city,
                        direction=internship.direction,
                        status=internship.status,
                    )
                )

            result.append(
                CompaniesAndInternshipsReportItem(
                    employer_id=employer.id,
                    company_name=employer.company_name,
                    internships=internships,
                )
            )

        return result

    def get_applications_by_internship_report(
        self,
        current_user: User,
    ) -> list[ApplicationsByInternshipReportItem]:
        self._check_admin_access(current_user)

        rows = self.repository.get_applications_count_by_internship()

        return [
            ApplicationsByInternshipReportItem(
                internship_id=row.internship_id,
                internship_title=row.internship_title,
                company_name=row.company_name,
                applications_count=row.applications_count,
            )
            for row in rows
        ]

    def get_students_count_report(self, current_user: User) -> StudentCountReportResponse:
        self._check_admin_access(current_user)

        students = self.repository.get_students_with_users()

        result = []
        for student in students:
            full_name = ""
            if student.user:
                first = student.user.first_name or ""
                last = student.user.last_name or ""
                full_name = f"{first} {last}".strip()

            result.append(
                StudentCountItem(
                    id=student.id,
                    full_name=full_name,
                )
            )

        return StudentCountReportResponse(
            total_students=len(result),
            students=result,
        )
    def get_students_education_report(
        self,
        current_user: User,
    ) -> StudentEducationReportResponse:
        self._check_admin_access(current_user)

        students = self.repository.get_students_with_users()
        result = []

        for student in students:
            full_name = ""
            if student.user:
                first = student.user.first_name or ""
                last = student.user.last_name or ""
                full_name = f"{first} {last}".strip()

            result.append(
                StudentEducationItem(
                    id=student.id,
                    full_name=full_name,
                    university=student.university,
                )
            )

        return StudentEducationReportResponse(
            total_students=len(result),
            students=result,
        )

    def get_employers_info_report(
        self,
        current_user: User,
    ) -> EmployerInfoReportResponse:
        self._check_admin_access(current_user)

        employers = self.repository.get_employers_with_internships_and_applications()
        result = []

        for employer in employers:
            internships_count = len(employer.internships)
            applications_count = 0

            for internship in employer.internships:
                applications_count += len(internship.applications)

            result.append(
                EmployerInfoItem(
                    employer_id=employer.id,
                    company_name=employer.company_name,
                    internships_count=internships_count,
                    applications_count=applications_count,
                )
            )

        return EmployerInfoReportResponse(
            total_employers=len(result),
            employers=result,
        )

    def get_student_applications_report(
        self,
        current_user: User,
    ) -> StudentApplicationsReportResponse:
        self._check_admin_access(current_user)

        applications = self.repository.get_all_applications_full()
        result = []

        for application in applications:
            student_full_name = ""
            internship_title = None
            company_name = None

            if application.student and application.student.user:
                first = application.student.user.first_name or ""
                last = application.student.user.last_name or ""
                student_full_name = f"{first} {last}".strip()

            if application.internship:
                internship_title = application.internship.title
                if application.internship.employer:
                    company_name = application.internship.employer.company_name

            result.append(
                StudentApplicationReportItem(
                    application_id=application.id,
                    student_id=application.student_id,
                    student_full_name=student_full_name,
                    internship_title=internship_title,
                    company_name=company_name,
                    applied_at=application.applied_at,
                    status=application.status.value if application.status else None,
                )
            )

        return StudentApplicationsReportResponse(
            total_applications=len(result),
            applications=result,
        )

    def get_directions_popularity_report(
        self,
        current_user: User,
    ) -> DirectionsPopularityReportResponse:
        self._check_admin_access(current_user)

        internships = self.repository.get_internships_with_applications()

        direction_stats: dict[str | None, dict[str, int]] = {}
        city_stats: dict[str | None, int] = {}

        for internship in internships:
            direction = internship.direction
            city = internship.city
            applications_count = len(internship.applications)

            if direction not in direction_stats:
                direction_stats[direction] = {
                    "internships_count": 0,
                    "applications_count": 0,
                }

            direction_stats[direction]["internships_count"] += 1
            direction_stats[direction]["applications_count"] += applications_count

            if city not in city_stats:
                city_stats[city] = 0
            city_stats[city] += 1

        directions_result = []
        for direction, stats in direction_stats.items():
            internships_count = stats["internships_count"]
            applications_count = stats["applications_count"]

            average = 0.0
            if internships_count > 0:
                average = applications_count / internships_count

            directions_result.append(
                DirectionPopularityItem(
                    direction=direction,
                    internships_count=internships_count,
                    applications_count=applications_count,
                    average_applications_per_internship=round(average, 2),
                )
            )

        directions_result.sort(
            key=lambda x: x.applications_count,
            reverse=True,
        )

        cities_result = [
            PopularCityItem(city=city, internships_count=count)
            for city, count in city_stats.items()
        ]
        cities_result.sort(key=lambda x: x.internships_count, reverse=True)

        return DirectionsPopularityReportResponse(
            directions=directions_result,
            most_popular_cities=cities_result,
        )

    def get_published_internships_pdf(self, current_user: User):
        self._check_admin_access(current_user)

        internships = self.get_published_internships_report(current_user)

        pdf_service = PDFService()
        return pdf_service.generate_published_internships_pdf(internships)

    def get_internships_by_city_pdf(self, current_user: User):
        report = self.get_internships_by_city_report(current_user)
        pdf_service = PDFService()
        return pdf_service.generate_internships_by_city_pdf(report)

    def get_companies_and_internships_pdf(self, current_user: User):
        report = self.get_companies_and_internships_report(current_user)
        pdf_service = PDFService()
        return pdf_service.generate_companies_and_internships_pdf(report)

    def get_applications_by_internship_pdf(self, current_user: User):
        report = self.get_applications_by_internship_report(current_user)
        pdf_service = PDFService()
        return pdf_service.generate_applications_by_internship_pdf(report)

    def get_students_count_pdf(self, current_user: User):
        report = self.get_students_count_report(current_user)
        pdf_service = PDFService()
        return pdf_service.generate_students_count_pdf(report)

    def get_students_education_pdf(self, current_user: User):
        report = self.get_students_education_report(current_user)
        pdf_service = PDFService()
        return pdf_service.generate_students_education_pdf(report)

    def get_employers_info_pdf(self, current_user: User):
        report = self.get_employers_info_report(current_user)
        pdf_service = PDFService()
        return pdf_service.generate_employers_info_pdf(report)

    def get_student_applications_pdf(self, current_user: User):
        report = self.get_student_applications_report(current_user)
        pdf_service = PDFService()
        return pdf_service.generate_student_applications_pdf(report)

    def get_directions_popularity_pdf(self, current_user: User):
        report = self.get_directions_popularity_report(current_user)
        pdf_service = PDFService()
        return pdf_service.generate_directions_popularity_pdf(report)