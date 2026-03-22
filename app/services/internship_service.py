from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.user import User
from app.repositories.internship_repository import InternshipRepository
from app.schemas.internship import (
    InternshipCreateRequest,
    InternshipPublicResponse,
    InternshipResponse,
    InternshipUpdateRequest,
)


class InternshipService:
    def __init__(self, db: Session):
        self.repository = InternshipRepository(db)

    def create_internship(self, current_user: User, data: InternshipCreateRequest) -> InternshipResponse:
        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Создавать стажировки может только работодатель",
            )

        employer = self.repository.get_employer_by_user_id(current_user.id)
        if not employer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Профиль работодателя не найден",
            )

        internship = self.repository.create_internship(
            employer_id=employer.id,
            title=data.title,
            description=data.description,
            city=data.city,
            direction=data.direction,
            salary=data.salary,
            deadline=data.deadline,
        )

        return InternshipResponse(
            id=internship.id,
            employer_id=internship.employer_id,
            title=internship.title,
            description=internship.description,
            city=internship.city,
            direction=internship.direction,
            salary=internship.salary,
            status=internship.status,
            deadline=internship.deadline,
            created_at=internship.created_at,
        )

    def get_my_internships(self, current_user: User) -> list[InternshipResponse]:
        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Доступ только для работодателей",
            )

        internships = self.repository.get_my_internships(current_user.id)
        return [
            InternshipResponse(
                id=item.id,
                employer_id=item.employer_id,
                title=item.title,
                description=item.description,
                city=item.city,
                direction=item.direction,
                salary=item.salary,
                status=item.status,
                deadline=item.deadline,
                created_at=item.created_at,
            )
            for item in internships
        ]

    def get_my_internship_by_id(self, current_user: User, internship_id: int) -> InternshipResponse:
        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Доступ только для работодателей",
            )

        internship = self.repository.get_my_internship_by_id(current_user.id, internship_id)
        if not internship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Стажировка не найдена",
            )

        return InternshipResponse(
            id=internship.id,
            employer_id=internship.employer_id,
            title=internship.title,
            description=internship.description,
            city=internship.city,
            direction=internship.direction,
            salary=internship.salary,
            status=internship.status,
            deadline=internship.deadline,
            created_at=internship.created_at,
        )

    def update_my_internship(
        self,
        current_user: User,
        internship_id: int,
        data: InternshipUpdateRequest,
    ) -> InternshipResponse:
        if current_user.role != UserRole.EMPLOYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Доступ только для работодателей",
            )

        internship = self.repository.get_my_internship_by_id(current_user.id, internship_id)
        if not internship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Стажировка не найдена",
            )

        if data.title is not None:
            internship.title = data.title
        if data.description is not None:
            internship.description = data.description
        if data.city is not None:
            internship.city = data.city
        if data.direction is not None:
            internship.direction = data.direction
        if data.salary is not None:
            internship.salary = data.salary
        if data.deadline is not None:
            internship.deadline = data.deadline
        if data.status is not None:
            internship.status = data.status

        internship = self.repository.save(internship)

        return InternshipResponse(
            id=internship.id,
            employer_id=internship.employer_id,
            title=internship.title,
            description=internship.description,
            city=internship.city,
            direction=internship.direction,
            salary=internship.salary,
            status=internship.status,
            deadline=internship.deadline,
            created_at=internship.created_at,
        )

    def get_active_internships(self) -> list[InternshipPublicResponse]:
        internships = self.repository.get_active_internships()
        result = []

        for item in internships:
            company_name = None
            if item.employer:
                company_name = item.employer.company_name

            result.append(
                InternshipPublicResponse(
                    id=item.id,
                    title=item.title,
                    description=item.description,
                    city=item.city,
                    direction=item.direction,
                    salary=item.salary,
                    status=item.status,
                    deadline=item.deadline,
                    created_at=item.created_at,
                    company_name=company_name,
                )
            )

        return result

    def get_public_internship_by_id(self, internship_id: int) -> InternshipPublicResponse:
        internship = self.repository.get_public_internship_by_id(internship_id)
        if not internship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Стажировка не найдена",
            )

        company_name = None
        if internship.employer:
            company_name = internship.employer.company_name

        return InternshipPublicResponse(
            id=internship.id,
            title=internship.title,
            description=internship.description,
            city=internship.city,
            direction=internship.direction,
            salary=internship.salary,
            status=internship.status,
            deadline=internship.deadline,
            created_at=internship.created_at,
            company_name=company_name,
        )