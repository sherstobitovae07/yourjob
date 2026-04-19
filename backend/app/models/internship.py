from datetime import date
from sqlalchemy import ForeignKey, String, Text, Integer, Enum, Date, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import InternshipStatus


class Internship(Base):
    __tablename__ = "internships"

    id: Mapped[int] = mapped_column(primary_key=True)
    employer_id: Mapped[int] = mapped_column(ForeignKey("employers.id", ondelete="CASCADE"))
    title: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(String(100))
    direction: Mapped[str | None] = mapped_column(String(100))
    salary: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[InternshipStatus | None] = mapped_column(
        Enum(InternshipStatus, name="internship_status")
    )
    deadline: Mapped[date | None] = mapped_column(Date)
    photo_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[str] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())

    employer = relationship("Employer", back_populates="internships")
    applications = relationship("Application", back_populates="internship")