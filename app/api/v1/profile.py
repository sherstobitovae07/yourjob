from fastapi import APIRouter, Depends
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