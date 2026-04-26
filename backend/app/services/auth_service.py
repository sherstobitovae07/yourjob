from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import EmployerRegisterRequest, LoginRequest, StudentRegisterRequest

import random
from datetime import datetime, timedelta
from app.models.enums import UserRole
from app.services.email_service import EmailService

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

        user = self.user_repository.create_student_user(
            email=data.email,
            password_hash=hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            university=data.university,
            faculty=data.faculty,
            specialty=data.specialty,
            resume_path=data.resume_path,
        )

        code = self._set_email_verification_code(user)
        EmailService.send_verification_code(user.email, code)

        return user

    def register_employer(self, data: EmployerRegisterRequest) -> User:
        existing_user = self.user_repository.get_by_email(data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует",
            )

        user = self.user_repository.create_employer_user(
            email=data.email,
            password_hash=hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            company_name=data.company_name,
            description=data.description,
            website=data.website,
        )
        code = self._set_email_verification_code(user)
        EmailService.send_verification_code(user.email, code)

        return user

    def login(self, data: LoginRequest) -> str:
        user = self.user_repository.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверные учетные данные",
            )
        if not user.is_email_verified and user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Подтвердите email перед входом",
            )

        return create_access_token(subject=user.id, role=user.role.value)

    def delete_current_user(self, current_user: User) -> None:
        self.user_repository.delete_user(current_user)

    def _generate_email_code(self) -> str:
        return str(random.randint(100000, 999999))

    def _set_email_verification_code(self, user: User) -> str:
        code = self._generate_email_code()

        user.email_verification_code = code
        user.email_verification_expires_at = datetime.utcnow() + timedelta(minutes=10)

        self.user_repository.save(user)

        return code

    def verify_email(self, email: str, code: str) -> None:
        user = self.user_repository.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Пользователь не найден",
            )

        if user.is_email_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email уже подтвержден",
            )

        if not user.email_verification_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Код подтверждения не найден",
            )

        if not user.email_verification_expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Время действия кода не найдено",
            )

        expires_at = user.email_verification_expires_at

        if expires_at.tzinfo is not None:
            expires_at = expires_at.replace(tzinfo=None)

        if datetime.utcnow() > expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Код подтверждения истек",
            )

        if user.email_verification_code != code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Неверный код подтверждения",
            )

        user.is_email_verified = True
        user.email_verification_code = None
        user.email_verification_expires_at = None

        self.user_repository.save(user)