from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    university: Mapped[str | None] = mapped_column(String(255))
    faculty: Mapped[str | None] = mapped_column(String(255))
    specialty: Mapped[str | None] = mapped_column(String(255))
    resume_path: Mapped[str | None] = mapped_column(Text)

    user = relationship("User", back_populates="student")
    applications = relationship("Application", back_populates="student")