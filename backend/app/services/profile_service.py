from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.enums import FnsCheckStatus, UserRole, VerificationStatus
from app.services.fns_service import FnsService
from app.utils.inn_validator import validate_inn
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
            inn=employer.inn,
            verification_status=employer.verification_status,
            verification_comment=employer.verification_comment,
            fns_company_name=employer.fns_company_name,
            fns_check_status=employer.fns_check_status,
            fns_check_comment=employer.fns_check_comment,
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
            inn=data.inn,
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
            inn=employer.inn,
            verification_status=employer.verification_status,
            verification_comment=employer.verification_comment,
            fns_company_name=employer.fns_company_name,
            fns_check_status=employer.fns_check_status,
            fns_check_comment=employer.fns_check_comment,
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

    def submit_employer_profile_for_verification(self, current_user: User) -> EmployerProfileResponse:
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

        if not employer.company_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Заполните название компании",
            )

        if not employer.description:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Заполните описание компании",
            )

        if not employer.website:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Заполните сайт компании",
            )

        if not employer.inn:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Заполните ИНН компании",
            )

        if not validate_inn(employer.inn):
            employer.fns_check_status = FnsCheckStatus.INVALID_INN
            employer.fns_check_comment = "ИНН не прошел проверку контрольной суммы"
            self.profile_repository.commit()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Некорректный ИНН",
            )

        fns_data = FnsService.check_company_by_inn(employer.inn)
        fns_company_name = FnsService.extract_company_name(fns_data)

        if fns_data.get("error"):
            employer.fns_check_status = FnsCheckStatus.API_ERROR
            employer.fns_check_comment = fns_data.get("message")
        elif fns_company_name:
            employer.fns_check_status = FnsCheckStatus.FOUND
            employer.fns_company_name = fns_company_name
            employer.fns_check_comment = "Компания найдена через API-ФНС"
        else:
            employer.fns_check_status = FnsCheckStatus.NOT_FOUND
            employer.fns_check_comment = "Компания не найдена через API-ФНС"

        employer.verification_status = VerificationStatus.PENDING
        employer.verification_comment = None

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
            inn=employer.inn,
            verification_status=employer.verification_status,
            verification_comment=employer.verification_comment,
            fns_company_name=employer.fns_company_name,
            fns_check_status=employer.fns_check_status,
            fns_check_comment=employer.fns_check_comment,
        )