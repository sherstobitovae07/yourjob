from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

from sqlalchemy import ForeignKey, String, Text, Enum
from app.models.enums import VerificationStatus, FnsCheckStatus

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

    inn: Mapped[str | None] = mapped_column(String(12), unique=True, nullable=True)

    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus, name="employer_verification_status"),
        nullable=False,
        default=VerificationStatus.PENDING,
    )

    verification_comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    fns_company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    fns_check_status: Mapped[FnsCheckStatus] = mapped_column(
        Enum(FnsCheckStatus, name="fns_check_status"),
        nullable=False,
        default=FnsCheckStatus.NOT_CHECKED,
    )

    fns_check_comment: Mapped[str | None] = mapped_column(Text, nullable=True)