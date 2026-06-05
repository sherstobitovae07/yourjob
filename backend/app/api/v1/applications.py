from fastapi import APIRouter, Depends, Body, Path
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

from app.schemas.auth import MessageResponse

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post(
    "",
    response_model=ApplicationResponse,
    summary="Создание отклика",
    description="Создает отклик студента на выбранную стажировку.",
    response_description="Данные созданного отклика",
)
def create_application(
    data: ApplicationCreateRequest = Body(
        example={
            "internship_id": 1,
        }
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ApplicationService(db)
    return service.create_application(current_user, data)


@router.get(
    "/my",
    response_model=list[StudentApplicationResponse],
    summary="Мои отклики",
    description="Возвращает список откликов текущего студента.",
    response_description="Список откликов студента",
)
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ApplicationService(db)
    return service.get_my_applications(current_user)


@router.get(
    "/internship/{internship_id}",
    response_model=list[InternshipApplicationResponse],
    summary="Отклики на стажировку",
    description="Возвращает список откликов на стажировку работодателя.",
    response_description="Список откликов по стажировке",
)
def get_applications_by_internship(
    internship_id: int = Path(description="ID стажировки"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ApplicationService(db)
    return service.get_applications_by_internship(current_user, internship_id)


@router.put(
    "/{application_id}/status",
    response_model=ApplicationResponse,
    summary="Изменение статуса отклика",
    description="Обновляет статус отклика студента на стажировку.",
    response_description="Отклик с обновленным статусом",
)
def update_application_status(
    application_id: int = Path(description="ID отклика"),
    data: ApplicationStatusUpdateRequest = Body(
        example={
            "status": "APPROVED",
        }
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ApplicationService(db)
    return service.update_application_status(current_user, application_id, data)


@router.delete(
    "/my/{application_id}",
    response_model=MessageResponse,
    summary="Удаление своего отклика",
    description="Удаляет отклик текущего студента.",
    response_description="Сообщение об удалении отклика",
)
def delete_my_application(
    application_id: int = Path(description="ID отклика"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ApplicationService(db)
    service.delete_my_application(current_user, application_id)
    return MessageResponse(message="Отклик удален")


@router.delete(
    "/employer/{application_id}",
    response_model=MessageResponse,
    summary="Удаление отклика работодателем",
    description="Удаляет отклик на стажировку работодателя.",
    response_description="Сообщение об удалении отклика",
)
def delete_application_as_employer(
    application_id: int = Path(description="ID отклика"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ApplicationService(db)
    service.delete_application_as_employer(current_user, application_id)
    return MessageResponse(message="Отклик удален работодателем")