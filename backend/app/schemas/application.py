from datetime import datetime

from pydantic import BaseModel

from app.models.enums import ApplicationStatus


class ApplicationCreateRequest(BaseModel):
    internship_id: int


class ApplicationStatusUpdateRequest(BaseModel):
    status: ApplicationStatus


class ApplicationResponse(BaseModel):
    id: int
    student_id: int
    internship_id: int
    status: ApplicationStatus | None = None
    applied_at: datetime | None = None


class StudentApplicationResponse(BaseModel):
    id: int
    internship_id: int
    internship_title: str | None = None
    company_name: str | None = None
    status: ApplicationStatus | None = None
    applied_at: datetime | None = None


class InternshipApplicationResponse(BaseModel):
    id: int
    student_id: int
    student_email: str | None = None
    student_first_name: str | None = None
    student_last_name: str | None = None
    status: ApplicationStatus | None = None
    applied_at: datetime | None = None