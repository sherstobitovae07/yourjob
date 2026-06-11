from fastapi import APIRouter, Depends, File, UploadFile, Body
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import (
    EmployerProfileResponse,
    EmployerProfileUpdateRequest,
    StudentProfileResponse,
    StudentProfileUpdateRequest,
)
from app.services.profile_service import ProfileService

from app.schemas.auth import MessageResponse
from app.services.auth_service import AuthService
from app.services.file_service import FileService
from app.repositories.profile_repository import ProfileRepository
from app.models.enums import UserRole
from fastapi import HTTPException

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get(
    "/student/me",
    response_model=StudentProfileResponse,
    summary="Профиль студента",
    description="Возвращает данные профиля авторизованного студента.",
    response_description="Данные профиля студента",
)
def get_student_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProfileService(db)
    return service.get_student_profile(current_user)


@router.put(
    "/student/me",
    response_model=StudentProfileResponse,
    summary="Редактирование профиля студента",
    description="Обновляет данные профиля авторизованного студента.",
    response_description="Обновленные данные профиля студента",
)
def update_student_profile(
    data: StudentProfileUpdateRequest = Body(
        example={
            "first_name": "Иван",
            "last_name": "Иванов",
            "university": "ПНИПУ",
            "faculty": "ПММ",
            "specialty": "Информационные системы и технологии",
            "resume_path": "media/resumes/student_resume.pdf",
        }
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProfileService(db)
    return service.update_student_profile(current_user, data)


@router.get(
    "/employer/me",
    response_model=EmployerProfileResponse,
    summary="Профиль работодателя",
    description="Возвращает данные профиля авторизованного работодателя.",
    response_description="Данные профиля работодателя",
)
def get_employer_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProfileService(db)
    return service.get_employer_profile(current_user)


@router.put(
    "/employer/me",
    response_model=EmployerProfileResponse,
    summary="Редактирование профиля работодателя",
    description="Обновляет данные профиля компании работодателя.",
    response_description="Обновленные данные профиля работодателя",
)
def update_employer_profile(
    data: EmployerProfileUpdateRequest = Body(
        example={
            "first_name": "Анна",
            "last_name": "Петрова",
            "company_name": "DataVision",
            "description": "Компания занимается разработкой цифровых сервисов.",
            "website": "https://datavision.example.com",
            "inn": "7707083893",
        }
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProfileService(db)
    return service.update_employer_profile(current_user, data)


@router.delete(
    "/me",
    response_model=MessageResponse,
    summary="Удаление аккаунта",
    description="Удаляет аккаунт текущего авторизованного пользователя.",
    response_description="Сообщение об удалении аккаунта",
)
def delete_my_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    service.delete_current_user(current_user)
    return MessageResponse(message="Аккаунт удален")


@router.post(
    "/student/me/photo",
    response_model=MessageResponse,
    summary="Загрузка фото студента",
    description="Загружает фотографию профиля студента.",
    response_description="Сообщение об успешной загрузке фото",
)
async def upload_student_photo(
    file: UploadFile = File(description="Файл изображения профиля студента"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Доступ только для студентов")

    repository = ProfileRepository(db)
    student = repository.get_student_by_user_id(current_user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Профиль студента не найден")

    FileService.delete_file(student.photo_path)
    saved_path = await FileService.save_student_photo(file)

    student.photo_path = saved_path
    repository.commit()
    repository.refresh(student)

    return MessageResponse(message="Фото студента успешно загружено")


@router.post(
    "/student/me/resume",
    response_model=MessageResponse,
    summary="Загрузка резюме студента",
    description="Загружает файл резюме студента.",
    response_description="Сообщение об успешной загрузке резюме",
)
async def upload_student_resume(
    file: UploadFile = File(description="PDF-файл резюме студента"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Доступ только для студентов")

    repository = ProfileRepository(db)
    student = repository.get_student_by_user_id(current_user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Профиль студента не найден")

    FileService.delete_file(student.resume_path)
    saved_path = await FileService.save_resume_pdf(file)

    student.resume_path = saved_path
    repository.commit()
    repository.refresh(student)

    return MessageResponse(message="Резюме успешно загружено")


@router.post(
    "/employer/me/photo",
    response_model=MessageResponse,
    summary="Загрузка фото работодателя",
    description="Загружает фотографию профиля работодателя.",
    response_description="Сообщение об успешной загрузке фото",
)
async def upload_employer_photo(
    file: UploadFile = File(description="Файл изображения профиля работодателя"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Доступ только для работодателей")

    repository = ProfileRepository(db)
    employer = repository.get_employer_by_user_id(current_user.id)
    if not employer:
        raise HTTPException(status_code=404, detail="Профиль работодателя не найден")

    FileService.delete_file(employer.photo_path)
    saved_path = await FileService.save_employer_photo(file)

    employer.photo_path = saved_path
    repository.commit()
    repository.refresh(employer)

    return MessageResponse(message="Фото работодателя успешно загружено")


@router.post(
    "/student/me/submit-for-verification",
    response_model=StudentProfileResponse,
    summary="Отправка профиля студента на проверку",
    description="Отправляет профиль студента на модерацию администратору.",
    response_description="Профиль студента со статусом проверки",
)
def submit_student_profile_for_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProfileService(db)
    return service.submit_student_profile_for_verification(current_user)


@router.post(
    "/employer/me/submit-for-verification",
    response_model=EmployerProfileResponse,
    summary="Отправка профиля работодателя на проверку",
    description="Отправляет профиль работодателя на модерацию администратору.",
    response_description="Профиль работодателя со статусом проверки",
)
def submit_employer_profile_for_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProfileService(db)
    return service.submit_employer_profile_for_verification(current_user)