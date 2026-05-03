from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.admin import (
    AdminEmployerResponse,
    AdminStatsResponse,
    AdminStudentRejectRequest,
    AdminStudentResponse,
    AdminUserResponse,
    AdminEmployerVerificationResponse,
    AdminEmployerRejectRequest,
)
from app.services.admin_service import AdminService
from app.schemas.auth import MessageResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[AdminUserResponse])
def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_all_users(current_user)


@router.get("/employers", response_model=list[AdminEmployerResponse])
def get_all_employers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_all_employers(current_user)


@router.get("/stats", response_model=AdminStatsResponse)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_stats(current_user)

@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    service.delete_user(current_user, user_id)
    return MessageResponse(message="Пользователь удален")

@router.delete("/internships/{internship_id}", response_model=MessageResponse)
def delete_internship(
    internship_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    service.delete_internship(current_user, internship_id)
    return MessageResponse(message="Стажировка удалена")

@router.delete("/applications/{application_id}", response_model=MessageResponse)
def delete_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    service.delete_application(current_user, application_id)
    return MessageResponse(message="Отклик удален")

@router.get("/students")
def get_students(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_all_students(current_user)

@router.get("/students/pending", response_model=list[AdminStudentResponse])
def get_pending_students(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_pending_students(current_user)

@router.get("/students/{student_id}", response_model=AdminStudentResponse)
def get_student_by_id(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_student_by_id(current_user, student_id)

@router.patch("/students/{student_id}/approve", response_model=MessageResponse)
def approve_student(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    service.approve_student(current_user, student_id)
    return MessageResponse(message="Профиль студента подтвержден")

@router.patch("/students/{student_id}/reject", response_model=MessageResponse)
def reject_student(
    student_id: int,
    data: AdminStudentRejectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    service.reject_student(current_user, student_id, data)
    return MessageResponse(message="Профиль студента отклонен")

@router.get("/employers/pending", response_model=list[AdminEmployerVerificationResponse])
def get_pending_employers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_pending_employers(current_user)

@router.get("/employers/{employer_id}", response_model=AdminEmployerVerificationResponse)
def get_employer_by_id(
    employer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_employer_by_id(current_user, employer_id)

@router.patch("/employers/{employer_id}/approve")
def approve_employer(
    employer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    service.approve_employer(current_user, employer_id)
    return {"message": "Профиль работодателя подтвержден"}

@router.patch("/employers/{employer_id}/reject")
def reject_employer(
    employer_id: int,
    data: AdminEmployerRejectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    service.reject_employer(current_user, employer_id, data)
    return {"message": "Профиль работодателя отклонен"}