from fastapi import APIRouter, Depends, File, UploadFile, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.internship import (
    InternshipCreateRequest,
    InternshipFilterParams,
    InternshipPublicResponse,
    InternshipResponse,
    InternshipUpdateRequest,
)
from app.services.internship_service import InternshipService
from app.schemas.auth import MessageResponse
from app.services.file_service import FileService
from fastapi import HTTPException
from app.models.enums import UserRole

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
    q: str | None = Query(default=None),
    city: str | None = Query(default=None),
    direction: str | None = Query(default=None),
    min_salary: int | None = Query(default=None, ge=0),
    max_salary: int | None = Query(default=None, ge=0),
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    filters = InternshipFilterParams(
        q=q,
        city=city,
        direction=direction,
        min_salary=min_salary,
        max_salary=max_salary,
    )
    return service.get_active_internships(filters)

@router.get("/{internship_id}", response_model=InternshipPublicResponse)
def get_public_internship_by_id(
    internship_id: int,
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    return service.get_public_internship_by_id(internship_id)

@router.delete("/my/{internship_id}", response_model=MessageResponse)
def delete_my_internship(
    internship_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    service.delete_my_internship(current_user, internship_id)
    return MessageResponse(message="Стажировка удалена")

@router.post("/my/{internship_id}/photo", response_model=MessageResponse)
async def upload_internship_photo(
    internship_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InternshipService(db)

    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Доступ только для работодателей")

    internship = service.repository.get_my_internship_by_id(current_user.id, internship_id)
    if not internship:
        raise HTTPException(status_code=404, detail="Стажировка не найдена")

    FileService.delete_file(internship.photo_path)
    saved_path = await FileService.save_internship_photo(file)

    internship.photo_path = saved_path
    service.repository.save(internship)

    return MessageResponse(message="Фото стажировки успешно загружено")