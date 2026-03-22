from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.admin import Admin
from app.models.application import Application
from app.models.employer import Employer
from app.models.internship import Internship
from app.models.student import Student


class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_admin_by_user_id(self, user_id: int) -> Admin | None:
        return self.db.query(Admin).filter(Admin.id == user_id).first()

    def get_all_internships(self) -> list[Internship]:
        return (
            self.db.query(Internship)
            .options(joinedload(Internship.employer))
            .order_by(Internship.id.desc())
            .all()
        )

    def get_all_employers_with_internships(self) -> list[Employer]:
        return (
            self.db.query(Employer)
            .options(joinedload(Employer.internships))
            .order_by(Employer.id.desc())
            .all()
        )

    def get_applications_count_by_internship(self):
        return (
            self.db.query(
                Internship.id.label("internship_id"),
                Internship.title.label("internship_title"),
                Employer.company_name.label("company_name"),
                func.count(Application.id).label("applications_count"),
            )
            .join(Employer, Internship.employer_id == Employer.id)
            .outerjoin(Application, Application.internship_id == Internship.id)
            .group_by(Internship.id, Internship.title, Employer.company_name)
            .order_by(Internship.id.desc())
            .all()
        )


    def get_students_with_users(self) -> list[Student]:
        return (
            self.db.query(Student)
            .options(joinedload(Student.user))
            .order_by(Student.id.desc())
            .all()
        )

    def get_employers_with_internships_and_applications(self) -> list[Employer]:
        return (
            self.db.query(Employer)
            .options(
                joinedload(Employer.user),
                joinedload(Employer.internships).joinedload(Internship.applications),
            )
            .order_by(Employer.id.desc())
            .all()
        )

    def get_all_applications_full(self) -> list[Application]:
        return (
            self.db.query(Application)
            .options(
                joinedload(Application.student).joinedload(Student.user),
                joinedload(Application.internship).joinedload(Internship.employer),
            )
            .order_by(Application.id.desc())
            .all()
        )

    def get_internships_with_applications(self) -> list[Internship]:
        return (
            self.db.query(Internship)
            .options(
                joinedload(Internship.applications),
                joinedload(Internship.employer),
            )
            .order_by(Internship.id.desc())
            .all()
        )