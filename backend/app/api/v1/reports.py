from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse

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


router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get(
    "/published-internships",
    response_model=list[PublishedInternshipReportItem],
    include_in_schema=False,
)
def get_published_internships_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_published_internships_report(current_user)


@router.get(
    "/internships-by-city",
    response_model=list[InternshipsByCityReportItem],
    include_in_schema=False,
)
def get_internships_by_city_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_internships_by_city_report(current_user)


@router.get(
    "/companies-and-internships",
    response_model=list[CompaniesAndInternshipsReportItem],
    include_in_schema=False,
)
def get_companies_and_internships_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_companies_and_internships_report(current_user)


@router.get(
    "/applications-by-internship",
    response_model=list[ApplicationsByInternshipReportItem],
    include_in_schema=False,
)
def get_applications_by_internship_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_applications_by_internship_report(current_user)


@router.get(
    "/students-count",
    response_model=StudentCountReportResponse,
    include_in_schema=False,
)
def get_students_count_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_students_count_report(current_user)


@router.get(
    "/students-education",
    response_model=StudentEducationReportResponse,
    include_in_schema=False,
)
def get_students_education_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_students_education_report(current_user)


@router.get(
    "/employers-info",
    response_model=EmployerInfoReportResponse,
    include_in_schema=False,
)
def get_employers_info_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_employers_info_report(current_user)


@router.get(
    "/student-applications",
    response_model=StudentApplicationsReportResponse,
    include_in_schema=False,
)
def get_student_applications_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_student_applications_report(current_user)


@router.get(
    "/directions-popularity",
    response_model=DirectionsPopularityReportResponse,
    include_in_schema=False,
)
def get_directions_popularity_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    return service.get_directions_popularity_report(current_user)


@router.get(
    "/pdf/published-internships",
    summary="PDF-отчет по опубликованным стажировкам",
    description="Формирует PDF-файл со списком опубликованных стажировок.",
    response_description="PDF-файл отчета",
)
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


@router.get(
    "/pdf/internships-by-city",
    summary="PDF-отчет по стажировкам в городах",
    description="Формирует PDF-файл со списком городов и доступных в них стажировок.",
    response_description="PDF-файл отчета",
)
def get_internships_by_city_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_internships_by_city_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=internships_by_city_report.pdf"
        },
    )


@router.get(
    "/pdf/companies-and-internships",
    summary="PDF-отчет по компаниям и стажировкам",
    description="Формирует PDF-файл со списком компаний и размещенных ими стажировок.",
    response_description="PDF-файл отчета",
)
def get_companies_and_internships_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_companies_and_internships_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=companies_and_internships_report.pdf"
        },
    )


@router.get(
    "/pdf/applications-by-internship",
    summary="PDF-отчет по откликам на стажировки",
    description="Формирует PDF-файл с количеством откликов по каждой стажировке.",
    response_description="PDF-файл отчета",
)
def get_applications_by_internship_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_applications_by_internship_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=applications_by_internship_report.pdf"
        },
    )


@router.get(
    "/pdf/students-count",
    summary="PDF-отчет по количеству студентов",
    description="Формирует PDF-файл с общим количеством студентов и их списком.",
    response_description="PDF-файл отчета",
)
def get_students_count_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_students_count_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=students_count_report.pdf"
        },
    )


@router.get(
    "/pdf/students-education",
    summary="PDF-отчет по образованию студентов",
    description="Формирует PDF-файл с информацией об учебных заведениях студентов.",
    response_description="PDF-файл отчета",
)
def get_students_education_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_students_education_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=students_education_report.pdf"
        },
    )


@router.get(
    "/pdf/employers-info",
    summary="PDF-отчет по работодателям",
    description="Формирует PDF-файл с информацией о работодателях, стажировках и откликах.",
    response_description="PDF-файл отчета",
)
def get_employers_info_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_employers_info_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=employers_info_report.pdf"
        },
    )


@router.get(
    "/pdf/student-applications",
    summary="PDF-отчет по откликам студентов",
    description="Формирует PDF-файл со сведениями о студентах, стажировках и статусах откликов.",
    response_description="PDF-файл отчета",
)
def get_student_applications_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_student_applications_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=student_applications_report.pdf"
        },
    )


@router.get(
    "/pdf/directions-popularity",
    summary="PDF-отчет по популярности направлений",
    description="Формирует PDF-файл со статистикой по направлениям стажировок и популярным городам.",
    response_description="PDF-файл отчета",
)
def get_directions_popularity_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReportService(db)
    pdf = service.get_directions_popularity_pdf(current_user)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=directions_popularity_report.pdf"
        },
    )