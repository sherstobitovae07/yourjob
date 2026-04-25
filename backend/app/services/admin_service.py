from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.enums import UserRole, VerificationStatus
from app.models.user import User
from app.repositories.admin_repository import AdminRepository
from app.schemas.admin import (
    AdminEmployerResponse,
    AdminStatsResponse,
    AdminStudentResponse,
    AdminStudentRejectRequest,
    AdminUserResponse,
)
from app.models.enums import VerificationStatus
from app.services.email_service import EmailService

class AdminService:
    def __init__(self, db: Session):
        self.repository = AdminRepository(db)

    def _check_admin_access(self, current_user: User) -> None:
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Доступ только для администратора",
            )

        admin = self.repository.get_admin_by_user_id(current_user.id)
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Профиль администратора не найден",
            )

    def get_all_users(self, current_user: User) -> list[AdminUserResponse]:
        self._check_admin_access(current_user)

        users = self.repository.get_all_users()
        return [
            AdminUserResponse(
                id=user.id,
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                role=user.role,
                created_at=user.created_at,
            )
            for user in users
        ]

    def get_all_employers(self, current_user: User) -> list[AdminEmployerResponse]:
        self._check_admin_access(current_user)

        employers = self.repository.get_all_employers()
        result = []

        for employer in employers:
            email = None
            first_name = None
            last_name = None
            created_at = None

            if employer.user:
                email = employer.user.email
                first_name = employer.user.first_name
                last_name = employer.user.last_name
                created_at = employer.user.created_at

            result.append(
                AdminEmployerResponse(
                    id=employer.id,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    company_name=employer.company_name,
                    description=employer.description,
                    website=employer.website,
                    created_at=created_at,
                )
            )

        return result

    def get_stats(self, current_user: User) -> AdminStatsResponse:
        self._check_admin_access(current_user)

        return AdminStatsResponse(
            total_users=self.repository.count_users(),
            total_students=self.repository.count_students(),
            total_employers=self.repository.count_employers(),
            total_admins=self.repository.count_admins(),
            total_internships=self.repository.count_internships(),
            total_applications=self.repository.count_applications(),
        )

    def delete_user(self, current_user: User, user_id: int) -> None:
        self._check_admin_access(current_user)

        user = self.repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Пользователь не найден",
            )

        self.repository.delete_user(user)


    def delete_internship(self, current_user: User, internship_id: int) -> None:
        self._check_admin_access(current_user)

        internship = self.repository.get_internship_by_id(internship_id)
        if not internship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Стажировка не найдена",
            )

        self.repository.delete_internship(internship)

    def delete_application(self, current_user: User, application_id: int) -> None:
        self._check_admin_access(current_user)

        application = self.repository.get_application_by_id(application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Отклик не найден",
            )

        self.repository.delete_application(application)

    def get_all_students(self, current_user: User):
        self._check_admin_access(current_user)
        students = self.repository.get_all_students()

        result = []
        for s in students:
            result.append({
                "id": s.id,
                "email": s.user.email if s.user else None,
                "first_name": s.user.first_name if s.user else None,
                "last_name": s.user.last_name if s.user else None,
                "university": s.university,
                "specialty": s.specialty,
                "status": s.verification_status,
            })
        return result

    def get_pending_students(self, current_user: User) -> list[AdminStudentResponse]:
        self._check_admin_access(current_user)

        students = self.repository.get_pending_students()
        result = []

        for student in students:
            email = None
            first_name = None
            last_name = None
            created_at = None

            if student.user:
                email = student.user.email
                first_name = student.user.first_name
                last_name = student.user.last_name
                created_at = student.user.created_at

            result.append(
                AdminStudentResponse(
                    id=student.id,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    university=student.university,
                    faculty=student.faculty,
                    specialty=student.specialty,
                    resume_path=student.resume_path,
                    photo_path=student.photo_path,
                    verification_status=student.verification_status,
                    verification_comment=student.verification_comment,
                    created_at=created_at,
                )
            )

        return result

    def approve_student(self, current_user: User, student_id: int) -> None:
        self._check_admin_access(current_user)

        student = self.repository.get_student_by_id(student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Студент не найден",
            )

        student.verification_status = VerificationStatus.APPROVED
        student.verification_comment = None
        self.repository.save_student(student)

        if student.user and student.user.email:
            EmailService.send_student_approved(student.user.email)


    def reject_student(
            self,
            current_user: User,
            student_id: int,
            data: AdminStudentRejectRequest,
    ) -> None:
        self._check_admin_access(current_user)

        student = self.repository.get_student_by_id(student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Студент не найден",
            )

        student.verification_status = VerificationStatus.REJECTED
        student.verification_comment = data.comment
        self.repository.save_student(student)

        if student.user and student.user.email:
            EmailService.send_student_rejected(
                student.user.email,
                data.comment,
            )

    def get_student_by_id(self, current_user: User, student_id: int) -> AdminStudentResponse:
        self._check_admin_access(current_user)

        student = self.repository.get_student_by_id(student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Студент не найден",
            )

        email = None
        first_name = None
        last_name = None
        created_at = None

        if student.user:
            email = student.user.email
            first_name = student.user.first_name
            last_name = student.user.last_name
            created_at = student.user.created_at

        return AdminStudentResponse(
            id=student.id,
            email=email,
            first_name=first_name,
            last_name=last_name,
            university=student.university,
            faculty=student.faculty,
            specialty=student.specialty,
            resume_path=student.resume_path,
            photo_path=student.photo_path,
            verification_status=student.verification_status,
            verification_comment=student.verification_comment,
            created_at=created_at,
        )