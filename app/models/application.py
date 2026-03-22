from sqlalchemy import ForeignKey, Enum, TIMESTAMP, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import ApplicationStatus


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint("student_id", "internship_id", name="uq_student_internship"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"))
    internship_id: Mapped[int] = mapped_column(ForeignKey("internships.id", ondelete="CASCADE"))
    applied_at: Mapped[str] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())
    status: Mapped[ApplicationStatus | None] = mapped_column(
        Enum(ApplicationStatus, name="application_status")
    )

    student = relationship("Student", back_populates="applications")
    internship = relationship("Internship", back_populates="applications")