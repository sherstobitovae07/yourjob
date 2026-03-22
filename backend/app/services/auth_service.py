from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import EmployerRegisterRequest, LoginRequest, StudentRegisterRequest


class AuthService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)

    def register_student(self, data: StudentRegisterRequest) -> User:
        existing_user = self.user_repository.get_by_email(data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует",
            )

        return self.user_repository.create_student_user(
            email=data.email,
            password_hash=hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            university=data.university,
            faculty=data.faculty,
            specialty=data.specialty,
            resume_path=data.resume_path,
        )

    def register_employer(self, data: EmployerRegisterRequest) -> User:
        existing_user = self.user_repository.get_by_email(data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует",
            )

        return self.user_repository.create_employer_user(
            email=data.email,
            password_hash=hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            company_name=data.company_name,
            description=data.description,
            website=data.website,
        )

    def login(self, data: LoginRequest) -> str:
        user = self.user_repository.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверные учетные данные",
            )

        return create_access_token(subject=user.id, role=user.role.value)