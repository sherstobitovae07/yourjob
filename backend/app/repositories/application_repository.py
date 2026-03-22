from sqlalchemy.orm import Session, joinedload

from app.models.application import Application
from app.models.enums import ApplicationStatus, InternshipStatus
from app.models.internship import Internship
from app.models.student import Student


class ApplicationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_student_by_user_id(self, user_id: int) -> Student | None:
        return self.db.query(Student).filter(Student.id == user_id).first()

    def get_internship_by_id(self, internship_id: int) -> Internship | None:
        return (
            self.db.query(Internship)
            .options(joinedload(Internship.employer))
            .filter(Internship.id == internship_id)
            .first()
        )

    def get_existing_application(self, student_id: int, internship_id: int) -> Application | None:
        return (
            self.db.query(Application)
            .filter(
                Application.student_id == student_id,
                Application.internship_id == internship_id,
            )
            .first()
        )

    def create_application(self, *, student_id: int, internship_id: int) -> Application:
        application = Application(
            student_id=student_id,
            internship_id=internship_id,
            status=ApplicationStatus.PENDING,
        )
        self.db.add(application)
        self.db.commit()
        self.db.refresh(application)
        return application

    def get_student_applications(self, student_id: int) -> list[Application]:
        return (
            self.db.query(Application)
            .options(
                joinedload(Application.internship).joinedload(Internship.employer)
            )
            .filter(Application.student_id == student_id)
            .order_by(Application.id.desc())
            .all()
        )

    def get_applications_by_internship_id(self, internship_id: int) -> list[Application]:
        return (
            self.db.query(Application)
            .options(joinedload(Application.student).joinedload(Student.user))
            .filter(Application.internship_id == internship_id)
            .order_by(Application.id.desc())
            .all()
        )

    def get_application_by_id(self, application_id: int) -> Application | None:
        return (
            self.db.query(Application)
            .options(
                joinedload(Application.internship),
                joinedload(Application.student).joinedload(Student.user),
            )
            .filter(Application.id == application_id)
            .first()
        )

    def save(self, application: Application) -> Application:
        self.db.add(application)
        self.db.commit()
        self.db.refresh(application)
        return application