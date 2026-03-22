from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.internship import (
    InternshipCreateRequest,
    InternshipPublicResponse,
    InternshipResponse,
    InternshipUpdateRequest,
)
from app.services.internship_service import InternshipService


router = APIRouter(prefix="/internships", tags=["Internships"])


@router.post("", response_model=InternshipResponse)
def create_internship(
    data: InternshipCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    return service.create_internship(current_user, data)


@router.get("/my", response_model=list[InternshipResponse])
def get_my_internships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    return service.get_my_internships(current_user)


@router.get("/my/{internship_id}", response_model=InternshipResponse)
def get_my_internship_by_id(
    internship_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    return service.get_my_internship_by_id(current_user, internship_id)


@router.put("/my/{internship_id}", response_model=InternshipResponse)
def update_my_internship(
    internship_id: int,
    data: InternshipUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    return service.update_my_internship(current_user, internship_id, data)


@router.get("", response_model=list[InternshipPublicResponse])
def get_active_internships(
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    return service.get_active_internships()


@router.get("/{internship_id}", response_model=InternshipPublicResponse)
def get_public_internship_by_id(
    internship_id: int,
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    return service.get_public_internship_by_id(internship_id)