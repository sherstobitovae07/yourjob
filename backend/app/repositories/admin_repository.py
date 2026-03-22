from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.admin import Admin
from app.models.application import Application
from app.models.employer import Employer
from app.models.internship import Internship
from app.models.student import Student
from app.models.user import User


class AdminRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_admin_by_user_id(self, user_id: int) -> Admin | None:
        return self.db.query(Admin).filter(Admin.id == user_id).first()

    def get_all_users(self) -> list[User]:
        return self.db.query(User).order_by(User.id.desc()).all()

    def get_all_employers(self) -> list[Employer]:
        return (
            self.db.query(Employer)
            .options(joinedload(Employer.user))
            .order_by(Employer.id.desc())
            .all()
        )

    def count_users(self) -> int:
        return self.db.query(func.count(User.id)).scalar() or 0

    def count_students(self) -> int:
        return self.db.query(func.count(Student.id)).scalar() or 0

    def count_employers(self) -> int:
        return self.db.query(func.count(Employer.id)).scalar() or 0

    def count_admins(self) -> int:
        return self.db.query(func.count(Admin.id)).scalar() or 0

    def count_internships(self) -> int:
        return self.db.query(func.count(Internship.id)).scalar() or 0

    def count_applications(self) -> int:
        return self.db.query(func.count(Application.id)).scalar() or 0