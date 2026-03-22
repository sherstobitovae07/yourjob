from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.enums import InternshipStatus


class InternshipCreateRequest(BaseModel):
    title: str = Field(..., max_length=255)
    description: str | None = None
    city: str | None = Field(default=None, max_length=100)
    direction: str | None = Field(default=None, max_length=100)
    salary: int | None = None
    deadline: date | None = None


class InternshipUpdateRequest(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    city: str | None = Field(default=None, max_length=100)
    direction: str | None = Field(default=None, max_length=100)
    salary: int | None = None
    deadline: date | None = None
    status: InternshipStatus | None = None


class InternshipResponse(BaseModel):
    id: int
    employer_id: int
    title: str | None = None
    description: str | None = None
    city: str | None = None
    direction: str | None = None
    salary: int | None = None
    status: InternshipStatus | None = None
    deadline: date | None = None
    created_at: datetime | None = None


class InternshipPublicResponse(BaseModel):
    id: int
    title: str | None = None
    description: str | None = None
    city: str | None = None
    direction: str | None = None
    salary: int | None = None
    status: InternshipStatus | None = None
    deadline: date | None = None
    created_at: datetime | None = None
    company_name: str | None = None