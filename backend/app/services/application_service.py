from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.enums import ApplicationStatus, InternshipStatus, UserRole
from app.models.user import User
from app.repositories.application_repository import ApplicationRepository
from app.schemas.application import (
    ApplicationCreateRequest,
    ApplicationResponse,
    ApplicationStatusUpdateRequest,
    InternshipApplicationResponse,
    StudentApplicationResponse,
)
from app.models.enums import VerificationStatus

class ApplicationService:
    def __init__(self, db: Session):
        self.repository = ApplicationRepository(db)

    def create_application(
        self,
        current_user: User,
        data: ApplicationCreateRequest,
    ) -> ApplicationResponse:


        if current_user.role != UserRole.STUDENT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Откликаться на стажировки может только студент",
            )

        student = self.repository.get_student_by_user_id(current_user.id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Профиль студента не найден",
            )
        if student.verification_status != VerificationStatus.APPROVED:
            raise HTTPException(
                status_code=403,
                detail="Аккаунт не подтвержден администратором",
            )

        internship = self.repository.get_internship_by_id(data.internship_id)
        if not internship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Стажировка не найдена",
            )

        if internship.status != InternshipStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Откликнуться можно только на активную стажировку",
            )

        existing_application = self.repository.get_existing_application(student.id, internship.id)
        if existing_application:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Вы уже откликались на эту стажировку",
            )

        application = self.repository.create_application(
            student_id=student.id,
            internship_id=internship.id,
        )

        return ApplicationResponse(
            id=application.id,
            student_id=application.student_id,
            internship_id=application.internship_id,
            status=application.status,
            applied_at=application.applied_at,
        )

    def get_my_applications(self, current_user: User) -> list[StudentApplicationResponse]:
        if current_user.role != UserRole.STUDENT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Доступ только для студентов",
            )

        student = self.repository.get_student_by_user_id(current_user.id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Профиль студента не найден",
            )

        applications = self.repository.get_student_applications(student.id)
        result = []

        for item in applications:
            internship_title = None
            company_name = None

            if item.internship:
                internship_title = item.internship.title
                if item.internship.employer:
                    company_name = item.internship.employer.company_name

            result.append(
                StudentApplicationResponse(
                    id=item.id,
                    internship_id=item.internship_id,
                    internship_title=internship_title,
                    company_name=company_name,
                    status=item.status,
                    applied_at=item.applied_at,
                )
            )

        return result

    def get_applications_by_internship(
        self,
        current_user: User,
        internship_id: int,
    ) -> list[InternshipApplicationResponse]:
        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Доступ только для работодателей",
            )

        internship = self.repository.get_internship_by_id(internship_id)
        if not internship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Стажировка не найдена",
            )

        if internship.employer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Вы можете просматривать отклики только на свои стажировки",
            )

        applications = self.repository.get_applications_by_internship_id(internship_id)
        result = []

        for item in applications:
            student_email = None
            student_first_name = None
            student_last_name = None

            if item.student and item.student.user:
                student_email = item.student.user.email
                student_first_name = item.student.user.first_name
                student_last_name = item.student.user.last_name

            result.append(
                InternshipApplicationResponse(
                    id=item.id,
                    student_id=item.student_id,
                    student_email=student_email,
                    student_first_name=student_first_name,
                    student_last_name=student_last_name,
                    status=item.status,
                    applied_at=item.applied_at,
                )
            )

        return result

    def update_application_status(
        self,
        current_user: User,
        application_id: int,
        data: ApplicationStatusUpdateRequest,
    ) -> ApplicationResponse:
        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Менять статус отклика может только работодатель",
            )

        application = self.repository.get_application_by_id(application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Отклик не найден",
            )

        if not application.internship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Стажировка для отклика не найдена",
            )

        if application.internship.employer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Вы можете менять статус только у откликов на свои стажировки",
            )

        application.status = data.status
        application = self.repository.save(application)

        return ApplicationResponse(
            id=application.id,
            student_id=application.student_id,
            internship_id=application.internship_id,
            status=application.status,
            applied_at=application.applied_at,
        )

    def delete_my_application(self, current_user: User, application_id: int) -> None:
        if current_user.role != UserRole.STUDENT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Удалять отклик может только студент",
            )

        student = self.repository.get_student_by_user_id(current_user.id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Профиль студента не найден",
            )

        application = self.repository.get_my_application(student.id, application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Отклик не найден",
            )

        self.repository.delete_application(application)

    def delete_application_as_employer(self, current_user: User, application_id: int) -> None:
        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Удалять отклики может только работодатель",
            )

        application = self.repository.get_application_by_id(application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Отклик не найден",
            )

        if not application.internship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Стажировка для отклика не найдена",
            )

        if application.internship.employer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Вы можете удалять только отклики на свои стажировки",
            )

        self.repository.delete_application(application)