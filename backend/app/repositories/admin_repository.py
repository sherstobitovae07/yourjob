from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.admin import Admin
from app.models.application import Application
from app.models.employer import Employer
from app.models.internship import Internship
from app.models.student import Student
from app.models.user import User
from app.models.enums import VerificationStatus

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

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def delete_user(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()

    def delete_internship(self, internship: Internship) -> None:
        self.db.delete(internship)
        self.db.commit()

    def get_application_by_id(self, application_id: int) -> Application | None:
        return self.db.query(Application).filter(Application.id == application_id).first()

    def delete_application(self, application: Application) -> None:
        self.db.delete(application)
        self.db.commit()

    def get_all_students(self) -> list[Student]:
        return (
            self.db.query(Student)
            .options(joinedload(Student.user))
            .order_by(Student.id.desc())
            .all()
        )

    def get_pending_students(self) -> list[Student]:
        return (
            self.db.query(Student)
            .options(joinedload(Student.user))
            .filter(Student.verification_status == VerificationStatus.PENDING)
            .order_by(Student.id.desc())
            .all()
        )

    def get_student_by_id(self, student_id: int) -> Student | None:
        return (
            self.db.query(Student)
            .options(joinedload(Student.user))
            .filter(Student.id == student_id)
            .first()
        )

    def save_student(self, student: Student) -> Student:
        self.db.add(student)
        self.db.commit()
        self.db.refresh(student)
        return student

    def get_internship_by_id(self, internship_id: int) -> Internship | None:
        return self.db.query(Internship).filter(Internship.id == internship_id).first()