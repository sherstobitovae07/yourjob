from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.enums import UserRole, VerificationStatus
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
            verification_status=student.verification_status,
            verification_comment=student.verification_comment,
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
            verification_status=student.verification_status,
            verification_comment=student.verification_comment,
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

    def submit_student_profile_for_verification(self, current_user: User) -> StudentProfileResponse:
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

        if not current_user.first_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Заполните имя",
            )

        if not current_user.last_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Заполните фамилию",
            )

        if not student.university:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Заполните университет",
            )

        if not student.faculty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Заполните факультет",
            )

        if not student.specialty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Заполните специальность",
            )

        if not student.resume_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Загрузите резюме",
            )

        student.verification_status = VerificationStatus.PENDING
        student.verification_comment = None

        self.profile_repository.commit()
        self.profile_repository.refresh(student)
        self.profile_repository.refresh(current_user)

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
            verification_status=student.verification_status,
            verification_comment=student.verification_comment,
        )