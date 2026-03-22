from datetime import datetime

from pydantic import BaseModel

from app.models.enums import UserRole


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