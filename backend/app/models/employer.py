from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Employer(Base):
    __tablename__ = "employers"

    id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    company_name: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    website: Mapped[str | None] = mapped_column(String(255))
    photo_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    user = relationship("User", back_populates="employer")
    internships = relationship(
        "Internship",
        back_populates="employer",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )