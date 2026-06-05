from fastapi import APIRouter, Depends, File, UploadFile, Query, Body, Path
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


@router.post(
    "",
    response_model=InternshipResponse,
    summary="Создание стажировки",
    description="Создает новую стажировку от имени авторизованного работодателя.",
    response_description="Данные созданной стажировки",
)
def create_internship(
    data: InternshipCreateRequest = Body(
        example={
            "title": "Стажер Python-разработчик",
            "description": "Разработка backend-сервисов на Python и FastAPI.",
            "city": "Пермь",
            "direction": "Backend-разработка",
            "salary": 30000,
            "deadline": "2026-06-30",
        }
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    return service.create_internship(current_user, data)


@router.get(
    "/my",
    response_model=list[InternshipResponse],
    summary="Мои стажировки",
    description="Возвращает список стажировок, созданных авторизованным работодателем.",
    response_description="Список стажировок работодателя",
)
def get_my_internships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    return service.get_my_internships(current_user)


@router.get(
    "/my/{internship_id}",
    response_model=InternshipResponse,
    summary="Моя стажировка по ID",
    description="Возвращает данные одной стажировки работодателя.",
    response_description="Данные стажировки работодателя",
)
def get_my_internship_by_id(
    internship_id: int = Path(description="ID стажировки"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    return service.get_my_internship_by_id(current_user, internship_id)


@router.put(
    "/my/{internship_id}",
    response_model=InternshipResponse,
    summary="Редактирование стажировки",
    description="Обновляет данные стажировки авторизованного работодателя.",
    response_description="Обновленные данные стажировки",
)
def update_my_internship(
    internship_id: int = Path(description="ID стажировки"),
    data: InternshipUpdateRequest = Body(
        example={
            "title": "Стажер Backend-разработчик",
            "description": "Работа с FastAPI, PostgreSQL и REST API.",
            "city": "Пермь",
            "direction": "Backend-разработка",
            "salary": 35000,
            "deadline": "2026-07-15",
            "status": "ACTIVE",
        }
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    return service.update_my_internship(current_user, internship_id, data)


@router.get(
    "",
    response_model=list[InternshipPublicResponse],
    summary="Поиск стажировок",
    description="Возвращает список активных стажировок с возможностью поиска и фильтрации.",
    response_description="Список найденных стажировок",
)
def get_active_internships(
    q: str | None = Query(
        default=None,
        description="Поиск по названию, городу или направлению стажировки",
        example="Python",
    ),
    city: str | None = Query(
        default=None,
        description="Фильтр по городу",
        example="Пермь",
    ),
    direction: str | None = Query(
        default=None,
        description="Фильтр по направлению стажировки",
        example="Backend-разработка",
    ),
    min_salary: int | None = Query(
        default=None,
        ge=0,
        description="Минимальная зарплата",
        example=20000,
    ),
    max_salary: int | None = Query(
        default=None,
        ge=0,
        description="Максимальная зарплата",
        example=60000,
    ),
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


@router.get(
    "/{internship_id}",
    response_model=InternshipPublicResponse,
    summary="Стажировка по ID",
    description="Возвращает публичную информацию о выбранной стажировке.",
    response_description="Данные стажировки",
)
def get_public_internship_by_id(
    internship_id: int = Path(description="ID стажировки"),
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    return service.get_public_internship_by_id(internship_id)


@router.delete(
    "/my/{internship_id}",
    response_model=MessageResponse,
    summary="Удаление стажировки",
    description="Удаляет стажировку авторизованного работодателя.",
    response_description="Сообщение об удалении стажировки",
)
def delete_my_internship(
    internship_id: int = Path(description="ID стажировки"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InternshipService(db)
    service.delete_my_internship(current_user, internship_id)
    return MessageResponse(message="Стажировка удалена")


@router.post(
    "/my/{internship_id}/photo",
    response_model=MessageResponse,
    summary="Загрузка фото стажировки",
    description="Загружает изображение для стажировки работодателя.",
    response_description="Сообщение об успешной загрузке фото",
)
async def upload_internship_photo(
    internship_id: int = Path(description="ID стажировки"),
    file: UploadFile = File(description="Файл изображения стажировки"),
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