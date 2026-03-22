from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.report import (
    ApplicationsByInternshipReportItem,
    CompaniesAndInternshipsReportItem,
    DirectionsPopularityReportResponse,
    EmployerInfoReportResponse,
    InternshipsByCityReportItem,
    PublishedInternshipReportItem,
    StudentApplicationsReportResponse,
    StudentCountReportResponse,
    StudentEducationReportResponse,
)
from app.services.report_service import ReportService
from app.schemas.report import StudentCountReportResponse
from fastapi.responses import StreamingResponse


router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/published-internships", response_model=list[PublishedInternshipReportItem])
def get_published_internships_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_published_internships_report(current_user)


@router.get("/internships-by-city", response_model=list[InternshipsByCityReportItem])
def get_internships_by_city_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_internships_by_city_report(current_user)


@router.get("/companies-and-internships", response_model=list[CompaniesAndInternshipsReportItem])
def get_companies_and_internships_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_companies_and_internships_report(current_user)


@router.get("/applications-by-internship", response_model=list[ApplicationsByInternshipReportItem])
def get_applications_by_internship_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_applications_by_internship_report(current_user)

@router.get("/students-count", response_model=StudentCountReportResponse)
def get_students_count_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_students_count_report(current_user)


@router.get("/students-education", response_model=StudentEducationReportResponse)
def get_students_education_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_students_education_report(current_user)


@router.get("/employers-info", response_model=EmployerInfoReportResponse)
def get_employers_info_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_employers_info_report(current_user)


@router.get("/student-applications", response_model=StudentApplicationsReportResponse)
def get_student_applications_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_student_applications_report(current_user)


@router.get("/directions-popularity", response_model=DirectionsPopularityReportResponse)
def get_directions_popularity_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_directions_popularity_report(current_user)

@router.get("/pdf/published-internships")
def get_published_internships_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_published_internships_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=internships_report.pdf"
        },
    )

@router.get("/pdf/internships-by-city")
def get_internships_by_city_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_internships_by_city_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=internships_by_city_report.pdf"},
    )


@router.get("/pdf/companies-and-internships")
def get_companies_and_internships_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_companies_and_internships_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=companies_and_internships_report.pdf"},
    )


@router.get("/pdf/applications-by-internship")
def get_applications_by_internship_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_applications_by_internship_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=applications_by_internship_report.pdf"},
    )


@router.get("/pdf/students-count")
def get_students_count_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_students_count_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=students_count_report.pdf"},
    )


@router.get("/pdf/students-education")
def get_students_education_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_students_education_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=students_education_report.pdf"},
    )


@router.get("/pdf/employers-info")
def get_employers_info_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_employers_info_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=employers_info_report.pdf"},
    )


@router.get("/pdf/student-applications")
def get_student_applications_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_student_applications_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=student_applications_report.pdf"},
    )


@router.get("/pdf/directions-popularity")
def get_directions_popularity_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_directions_popularity_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=directions_popularity_report.pdf"},
    )