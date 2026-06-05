from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.schemas.auth import (
    EmployerRegisterRequest,
    LoginRequest,
    StudentRegisterRequest,
    TokenResponse,
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.schemas.auth import EmailVerifyRequest, MessageResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register/student",
    response_model=UserResponse,
    summary="Регистрация студента",
    description="Создает нового пользователя с ролью STUDENT.",
    response_description="Данные зарегистрированного студента",
)
def register_student(
    data: StudentRegisterRequest = Body(
        ...,
        example={
            "email": "student@example.com",
            "password": "12345678",
            "first_name": "Иван",
            "last_name": "Иванов",
            "university": "ПНИПУ",
            "faculty": "ПММ",
            "specialty": "Информационные системы и технологии",
            "resume_path": "media/resumes/student_resume.pdf",
        },
    ),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    return service.register_student(data)


@router.post(
    "/register/employer",
    response_model=UserResponse,
    summary="Регистрация работодателя",
    description="Создает нового пользователя с ролью EMPLOYER.",
    response_description="Данные зарегистрированного работодателя",
)
def register_employer(
    data: EmployerRegisterRequest = Body(
        ...,
        example={
            "email": "employer@example.com",
            "password": "12345678",
            "first_name": "Анна",
            "last_name": "Петрова",
            "company_name": "DataVision",
            "description": "Компания занимается разработкой цифровых сервисов.",
            "website": "https://datavision.example.com",
            "inn": "7707083893",
        },
    ),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    return service.register_employer(data)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Авторизация пользователя",
    description="Выполняет вход в систему и возвращает JWT-токен.",
    response_description="JWT access token",
)
def login(
    data: LoginRequest = Body(
        ...,
        example={
            "email": "user@example.com",
            "password": "12345678",
        },
    ),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    token = service.login(data)
    return TokenResponse(access_token=token)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Текущий пользователь",
    description="Возвращает данные авторизованного пользователя.",
    response_description="Данные текущего пользователя",
)
def me(current_user=Depends(get_current_user)):
    return current_user


@router.post(
    "/verify-email",
    response_model=MessageResponse,
    summary="Подтверждение email",
    description="Подтверждает email пользователя по шестизначному коду.",
    response_description="Сообщение о подтверждении email",
)
def verify_email(
    data: EmailVerifyRequest = Body(
        ...,
        example={
            "email": "student@example.com",
            "code": "123456",
        },
    ),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    service.verify_email(data.email, data.code)
    return MessageResponse(message="Email подтвержден")