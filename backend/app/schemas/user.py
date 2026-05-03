from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import UserRole, VerificationStatus


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    role: UserRole
    created_at: datetime | None = None


class StudentProfileResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    role: UserRole

    university: str | None = None
    faculty: str | None = None
    specialty: str | None = None
    resume_path: str | None = None
    photo_path: str | None = None
    verification_status: VerificationStatus | None = None
    verification_comment: str | None = None

class StudentProfileUpdateRequest(BaseModel):
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    university: str | None = Field(default=None, max_length=255)
    faculty: str | None = Field(default=None, max_length=255)
    specialty: str | None = Field(default=None, max_length=255)
    resume_path: str | None = None


class EmployerProfileResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    role: UserRole

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

class EmployerProfileUpdateRequest(BaseModel):
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    company_name: str | None = Field(default=None, max_length=255)
    description: str | None = None
    website: str | None = Field(default=None, max_length=255)
    inn: str | None = Field(default=None, max_length=12)