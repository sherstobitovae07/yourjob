from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.application import (
    ApplicationCreateRequest,
    ApplicationResponse,
    ApplicationStatusUpdateRequest,
    InternshipApplicationResponse,
    StudentApplicationResponse,
)
from app.services.application_service import ApplicationService


router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("", response_model=ApplicationResponse)
def create_application(
    data: ApplicationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ApplicationService(db)
    return service.create_application(current_user, data)


@router.get("/my", response_model=list[StudentApplicationResponse])
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ApplicationService(db)
    return service.get_my_applications(current_user)


@router.get("/internship/{internship_id}", response_model=list[InternshipApplicationResponse])
def get_applications_by_internship(
    internship_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ApplicationService(db)
    return service.get_applications_by_internship(current_user, internship_id)


@router.put("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ApplicationService(db)
    return service.update_application_status(current_user, application_id, data)