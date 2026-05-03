from datetime import datetime

from pydantic import BaseModel

from app.models.enums import UserRole, VerificationStatus


class AdminUserResponse(BaseModel):
    id: int
    email: str
    first_name: str | None = None
    last_name: str | None = None
    role: UserRole
    created_at: datetime | None = None


class AdminEmployerResponse(BaseModel):
    id: int
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    company_name: str | None = None
    description: str | None = None
    website: str | None = None
    created_at: datetime | None = None


class AdminStatsResponse(BaseModel):
    total_users: int
    total_students: int
    total_employers: int
    total_admins: int
    total_internships: int
    total_applications: int

class AdminStudentResponse(BaseModel):
    id: int
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    university: str | None = None
    faculty: str | None = None
    specialty: str | None = None
    resume_path: str | None = None
    photo_path: str | None = None
    verification_status: VerificationStatus | None = None
    verification_comment: str | None = None
    created_at: datetime | None = None

class AdminStudentRejectRequest(BaseModel):
    comment: str

class AdminEmployerVerificationResponse(BaseModel):
    id: int
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    company_name: str | None = None
    description: str | None = None
    website: str | None = None
    photo_path: str | None = None
    inn: str | None = None
    verification_status: str | None = None
    verification_comment: str | None = None
    fns_company_name: str | None = None
    fns_check_status: str | None = None
    fns_check_comment: str | None = None
    created_at: datetime | None = None


class AdminEmployerRejectRequest(BaseModel):
    comment: str