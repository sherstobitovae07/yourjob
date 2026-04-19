from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.admin import (
    AdminEmployerResponse,
    AdminStatsResponse,
    AdminUserResponse,
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