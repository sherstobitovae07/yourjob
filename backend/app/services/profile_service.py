from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.user import User
from app.repositories.profile_repository import ProfileRepository
from app.schemas.user import (
    EmployerProfileResponse,
    EmployerProfileUpdateRequest,
    StudentProfileResponse,
    StudentProfileUpdateRequest,
)


class ProfileService:
    def __init__(self, db: Session):
        self.profile_repository = ProfileRepository(db)

    def get_student_profile(self, current_user: User) -> StudentProfileResponse:
        if current_user.role != UserRole.STUDENT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Доступ только для студентов",
            )

        student = self.profile_repository.get_student_by_user_id(current_user.id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Профиль студента не найден",
            )

        return StudentProfileResponse(
            id=current_user.id,
            email=current_user.email,
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            role=current_user.role,
            university=student.university,
            faculty=student.faculty,
            specialty=student.specialty,
            resume_path=student.resume_path,
            photo_path=student.photo_path,
        )

    def update_student_profile(
        self,
        current_user: User,
        data: StudentProfileUpdateRequest,
    ) -> StudentProfileResponse:
        if current_user.role != UserRole.STUDENT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Доступ только для студентов",
            )

        student = self.profile_repository.get_student_by_user_id(current_user.id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Профиль студента не найден",
            )

        self.profile_repository.update_user_basic_info(
            current_user,
            first_name=data.first_name,
            last_name=data.last_name,
        )

        self.profile_repository.update_student_profile(
            student,
            university=data.university,
            faculty=data.faculty,
            specialty=data.specialty,
            resume_path=data.resume_path,
        )

        self.profile_repository.commit()
        self.profile_repository.refresh(current_user)
        self.profile_repository.refresh(student)

        return StudentProfileResponse(
            id=current_user.id,
            email=current_user.email,
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            role=current_user.role,
            university=student.university,
            faculty=student.faculty,
            specialty=student.specialty,
            resume_path=student.resume_path,
            photo_path=student.photo_path,
        )

    def get_employer_profile(self, current_user: User) -> EmployerProfileResponse:
        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Доступ только для работодателей",
            )

        employer = self.profile_repository.get_employer_by_user_id(current_user.id)
        if not employer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Профиль работодателя не найден",
            )

        return EmployerProfileResponse(
            id=current_user.id,
            email=current_user.email,
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            role=current_user.role,
            company_name=employer.company_name,
            description=employer.description,
            website=employer.website,
            photo_path=employer.photo_path,
        )

    def update_employer_profile(
        self,
        current_user: User,
        data: EmployerProfileUpdateRequest,
    ) -> EmployerProfileResponse:
        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Доступ только для работодателей",
            )

        employer = self.profile_repository.get_employer_by_user_id(current_user.id)
        if not employer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Профиль работодателя не найден",
            )

        self.profile_repository.update_user_basic_info(
            current_user,
            first_name=data.first_name,
            last_name=data.last_name,
        )

        self.profile_repository.update_employer_profile(
            employer,
            company_name=data.company_name,
            description=data.description,
            website=data.website,
        )

        self.profile_repository.commit()
        self.profile_repository.refresh(current_user)
        self.profile_repository.refresh(employer)

        return EmployerProfileResponse(
            id=current_user.id,
            email=current_user.email,
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            role=current_user.role,
            company_name=employer.company_name,
            description=employer.description,
            website=employer.website,
            photo_path=employer.photo_path,
        )

    def get_student_profile_by_id(self, student_id: int, current_user: User) -> StudentProfileResponse:
        if current_user.role not in [UserRole.EMPLOYER, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Доступ только для работодателей и администраторов",
            )

        student_user = self.profile_repository.get_user_by_id(student_id)
        if not student_user or student_user.role != UserRole.STUDENT:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Студент не найден",
            )

        student = self.profile_repository.get_student_by_user_id(student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Профиль студента не найден",
            )

        return StudentProfileResponse(
            id=student_user.id,
            email=student_user.email,
            first_name=student_user.first_name,
            last_name=student_user.last_name,
            role=student_user.role,
            university=student.university,
            faculty=student.faculty,
            specialty=student.specialty,
            resume_path=student.resume_path,
        )