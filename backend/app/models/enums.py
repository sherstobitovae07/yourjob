import enum


class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    EMPLOYER = "EMPLOYER"
    ADMIN = "ADMIN"


class ApplicationStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class InternshipStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"