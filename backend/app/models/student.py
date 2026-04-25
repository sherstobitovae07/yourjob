from sqlalchemy import ForeignKey, String, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import VerificationStatus

class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    university: Mapped[str | None] = mapped_column(String(255))
    faculty: Mapped[str | None] = mapped_column(String(255))
    specialty: Mapped[str | None] = mapped_column(String(255))
    resume_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    photo_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    user = relationship("User", back_populates="student")
    applications = relationship(
        "Application",
        back_populates="student",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    verification_status: Mapped[VerificationStatus | None] = mapped_column(
        Enum(VerificationStatus, name="verification_status"),
        nullable=False,
        default=VerificationStatus.PENDING,
    )
    verification_comment: Mapped[str | None] = mapped_column(Text, nullable=True)