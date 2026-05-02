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

class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class FnsCheckStatus(str, enum.Enum):
    NOT_CHECKED = "NOT_CHECKED"
    FOUND = "FOUND"
    NOT_FOUND = "NOT_FOUND"
    INVALID_INN = "INVALID_INN"
    API_ERROR = "API_ERROR"