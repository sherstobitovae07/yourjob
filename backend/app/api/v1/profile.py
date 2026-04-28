from fastapi import APIRouter, Depends, File, UploadFile
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


@router.get("/student/me", response_model=StudentProfileResponse)
def get_student_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProfileService(db)
    return service.get_student_profile(current_user)


@router.put("/student/me", response_model=StudentProfileResponse)
def update_student_profile(
    data: StudentProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProfileService(db)
    return service.update_student_profile(current_user, data)


@router.get("/employer/me", response_model=EmployerProfileResponse)
def get_employer_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProfileService(db)
    return service.get_employer_profile(current_user)


@router.put("/employer/me", response_model=EmployerProfileResponse)
def update_employer_profile(
    data: EmployerProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProfileService(db)
    return service.update_employer_profile(current_user, data)

@router.delete("/me", response_model=MessageResponse)
def delete_my_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    service.delete_current_user(current_user)
    return MessageResponse(message="Аккаунт удален")

@router.post("/student/me/photo", response_model=MessageResponse)
async def upload_student_photo(
    file: UploadFile = File(...),
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


@router.get("/student/{student_id}", response_model=StudentProfileResponse)
def get_student_profile_by_id(
    student_id: int,
    db: Session = Depends(get_db),
):
    """Public endpoint to fetch a student's public profile by student id."""
    repository = ProfileRepository(db)
    student = repository.get_student_by_user_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Профиль студента не найден")

    user = student.user
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return StudentProfileResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        university=student.university,
        faculty=student.faculty,
        specialty=student.specialty,
        resume_path=student.resume_path,
        photo_path=student.photo_path,
        verification_status=student.verification_status,
        verification_comment=student.verification_comment,
    )


@router.post("/student/me/resume", response_model=MessageResponse)
async def upload_student_resume(
    file: UploadFile = File(...),
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


@router.post("/employer/me/photo", response_model=MessageResponse)
async def upload_employer_photo(
    file: UploadFile = File(...),
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

@router.post("/student/me/submit-for-verification", response_model=StudentProfileResponse)
def submit_student_profile_for_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProfileService(db)
    return service.submit_student_profile_for_verification(current_user)