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