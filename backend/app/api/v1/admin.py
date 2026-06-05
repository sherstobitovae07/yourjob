from fastapi import APIRouter, Depends, Body, Path
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


@router.get(
    "/users",
    response_model=list[AdminUserResponse],
    summary="Список пользователей",
    description="Возвращает список всех пользователей системы.",
    response_description="Список пользователей",
)
def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_all_users(current_user)


@router.get(
    "/employers",
    response_model=list[AdminEmployerResponse],
    summary="Список работодателей",
    description="Возвращает список всех работодателей.",
    response_description="Список работодателей",
)
def get_all_employers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_all_employers(current_user)


@router.get(
    "/stats",
    response_model=AdminStatsResponse,
    summary="Статистика системы",
    description="Возвращает общую статистику по пользователям, стажировкам и откликам.",
    response_description="Статистика системы",
)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_stats(current_user)


@router.delete(
    "/users/{user_id}",
    response_model=MessageResponse,
    summary="Удаление пользователя",
    description="Удаляет пользователя по ID.",
    response_description="Сообщение об удалении пользователя",
)
def delete_user(
    user_id: int = Path(description="ID пользователя"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    service.delete_user(current_user, user_id)
    return MessageResponse(message="Пользователь удален")


@router.delete(
    "/internships/{internship_id}",
    response_model=MessageResponse,
    summary="Удаление стажировки",
    description="Удаляет стажировку по ID.",
    response_description="Сообщение об удалении стажировки",
)
def delete_internship(
    internship_id: int = Path(description="ID стажировки"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    service.delete_internship(current_user, internship_id)
    return MessageResponse(message="Стажировка удалена")


@router.delete(
    "/applications/{application_id}",
    response_model=MessageResponse,
    summary="Удаление отклика",
    description="Удаляет отклик по ID.",
    response_description="Сообщение об удалении отклика",
)
def delete_application(
    application_id: int = Path(description="ID отклика"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    service.delete_application(current_user, application_id)
    return MessageResponse(message="Отклик удален")


@router.get(
    "/students",
    summary="Список студентов",
    description="Возвращает список всех студентов системы.",
    response_description="Список студентов",
)
def get_students(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_all_students(current_user)


@router.get(
    "/students/pending",
    response_model=list[AdminStudentResponse],
    summary="Студенты на проверке",
    description="Возвращает список студентов, ожидающих модерации.",
    response_description="Список студентов на проверке",
)
def get_pending_students(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_pending_students(current_user)


@router.get(
    "/students/{student_id}",
    response_model=AdminStudentResponse,
    summary="Студент по ID",
    description="Возвращает данные студента для проверки администратором.",
    response_description="Данные студента",
)
def get_student_by_id(
    student_id: int = Path(description="ID студента"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_student_by_id(current_user, student_id)


@router.patch(
    "/students/{student_id}/approve",
    response_model=MessageResponse,
    summary="Подтверждение студента",
    description="Подтверждает профиль студента после проверки.",
    response_description="Сообщение о подтверждении профиля студента",
)
def approve_student(
    student_id: int = Path(description="ID студента"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    service.approve_student(current_user, student_id)
    return MessageResponse(message="Профиль студента подтвержден")


@router.patch(
    "/students/{student_id}/reject",
    response_model=MessageResponse,
    summary="Отклонение студента",
    description="Отклоняет профиль студента с указанием причины.",
    response_description="Сообщение об отклонении профиля студента",
)
def reject_student(
    student_id: int = Path(description="ID студента"),
    data: AdminStudentRejectRequest = Body(
        example={
            "comment": "Необходимо загрузить актуальное резюме.",
        }
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    service.reject_student(current_user, student_id, data)
    return MessageResponse(message="Профиль студента отклонен")


@router.get(
    "/employers/pending",
    response_model=list[AdminEmployerVerificationResponse],
    summary="Работодатели на проверке",
    description="Возвращает список работодателей, ожидающих модерации.",
    response_description="Список работодателей на проверке",
)
def get_pending_employers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_pending_employers(current_user)


@router.get(
    "/employers/{employer_id}",
    response_model=AdminEmployerVerificationResponse,
    summary="Работодатель по ID",
    description="Возвращает данные работодателя для проверки администратором.",
    response_description="Данные работодателя",
)
def get_employer_by_id(
    employer_id: int = Path(description="ID работодателя"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    return service.get_employer_by_id(current_user, employer_id)


@router.patch(
    "/employers/{employer_id}/approve",
    summary="Подтверждение работодателя",
    description="Подтверждает профиль работодателя после проверки.",
    response_description="Сообщение о подтверждении профиля работодателя",
)
def approve_employer(
    employer_id: int = Path(description="ID работодателя"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    service.approve_employer(current_user, employer_id)
    return {"message": "Профиль работодателя подтвержден"}


@router.patch(
    "/employers/{employer_id}/reject",
    summary="Отклонение работодателя",
    description="Отклоняет профиль работодателя с указанием причины.",
    response_description="Сообщение об отклонении профиля работодателя",
)
def reject_employer(
    employer_id: int = Path(description="ID работодателя"),
    data: AdminEmployerRejectRequest = Body(
        example={
            "comment": "Данные компании не совпадают с результатами проверки по ИНН.",
        }
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AdminService(db)
    service.reject_employer(current_user, employer_id, data)
    return {"message": "Профиль работодателя отклонен"}