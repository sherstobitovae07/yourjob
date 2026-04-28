from sqlalchemy import ForeignKey, String, Text, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    admin_id: Mapped[int | None] = mapped_column(ForeignKey("admins.id"))
    type: Mapped[str | None] = mapped_column(String(100))
    generated_at: Mapped[str] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())
    file_path: Mapped[str | None] = mapped_column(Text)

    admin = relationship("Admin", back_populates="reports")