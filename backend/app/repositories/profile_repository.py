from sqlalchemy.orm import Session

from app.models.employer import Employer
from app.models.student import Student
from app.models.user import User


class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_student_by_user_id(self, user_id: int) -> Student | None:
        return self.db.query(Student).filter(Student.id == user_id).first()

    def get_employer_by_user_id(self, user_id: int) -> Employer | None:
        return self.db.query(Employer).filter(Employer.id == user_id).first()

    def update_user_basic_info(
        self,
        user: User,
        *,
        first_name: str | None,
        last_name: str | None,
    ) -> User:
        user.first_name = first_name
        user.last_name = last_name
        self.db.add(user)
        return user

    def update_student_profile(
        self,
        student: Student,
        *,
        university: str | None,
        faculty: str | None,
        specialty: str | None,
        resume_path: str | None,
    ) -> Student:
        student.university = university
        student.faculty = faculty
        student.specialty = specialty
        student.resume_path = resume_path
        self.db.add(student)
        return student

    def update_employer_profile(
        self,
        employer: Employer,
        *,
        company_name: str | None,
        description: str | None,
        website: str | None,
        inn: str | None,
    ) -> Employer:
        employer.company_name = company_name
        employer.description = description
        employer.website = website
        if inn is not None:
            employer.inn = inn
        self.db.add(employer)
        return employer

    def commit(self) -> None:
        self.db.commit()

    def refresh(self, obj) -> None:
        self.db.refresh(obj)