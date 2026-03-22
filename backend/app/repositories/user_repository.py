from sqlalchemy.orm import Session

from app.models.employer import Employer
from app.models.enums import UserRole
from app.models.student import Student
from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def create_student_user(
        self,
        *,
        email: str,
        password_hash: str,
        first_name: str | None,
        last_name: str | None,
        university: str | None,
        faculty: str | None,
        specialty: str | None,
        resume_path: str | None,
    ) -> User:
        user = User(
            email=email,
            password_hash=password_hash,
            first_name=first_name,
            last_name=last_name,
            role=UserRole.STUDENT,
        )
        self.db.add(user)
        self.db.flush()

        student = Student(
            id=user.id,
            university=university,
            faculty=faculty,
            specialty=specialty,
            resume_path=resume_path,
        )
        self.db.add(student)

        self.db.commit()
        self.db.refresh(user)
        return user

    def create_employer_user(
        self,
        *,
        email: str,
        password_hash: str,
        first_name: str | None,
        last_name: str | None,
        company_name: str | None,
        description: str | None,
        website: str | None,
    ) -> User:
        user = User(
            email=email,
            password_hash=password_hash,
            first_name=first_name,
            last_name=last_name,
            role=UserRole.EMPLOYER,
        )
        self.db.add(user)
        self.db.flush()

        employer = Employer(
            id=user.id,
            company_name=company_name,
            description=description,
            website=website,
        )
        self.db.add(employer)

        self.db.commit()
        self.db.refresh(user)
        return user