from sqlalchemy.orm import Session, joinedload

from app.models.employer import Employer
from app.models.enums import InternshipStatus
from app.models.internship import Internship
from sqlalchemy import or_

class InternshipRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_employer_by_user_id(self, user_id: int) -> Employer | None:
        return self.db.query(Employer).filter(Employer.id == user_id).first()

    def create_internship(
        self,
        *,
        employer_id: int,
        title: str,
        description: str | None,
        city: str | None,
        direction: str | None,
        salary: int | None,
        deadline,
    ) -> Internship:
        internship = Internship(
            employer_id=employer_id,
            title=title,
            description=description,
            city=city,
            direction=direction,
            salary=salary,
            deadline=deadline,
            status=InternshipStatus.ACTIVE,
        )
        self.db.add(internship)
        self.db.commit()
        self.db.refresh(internship)
        return internship

    def get_my_internships(self, employer_id: int) -> list[Internship]:
        return (
            self.db.query(Internship)
            .filter(Internship.employer_id == employer_id)
            .order_by(Internship.id.desc())
            .all()
        )

    def get_my_internship_by_id(self, employer_id: int, internship_id: int) -> Internship | None:
        return (
            self.db.query(Internship)
            .filter(
                Internship.id == internship_id,
                Internship.employer_id == employer_id,
            )
            .first()
        )

    def get_active_internships(
            self,
            *,
            q: str | None = None,
            city: str | None = None,
            direction: str | None = None,
            min_salary: int | None = None,
            max_salary: int | None = None,
    ) -> list[Internship]:
        query = (
            self.db.query(Internship)
            .join(Employer, Internship.employer_id == Employer.id)
            .options(joinedload(Internship.employer))
            .filter(Internship.status == InternshipStatus.ACTIVE)
        )

        if q:
            search = f"%{q.strip()}%"
            query = query.filter(
                or_(
                    Internship.title.ilike(search),
                    Internship.description.ilike(search),
                    Internship.city.ilike(search),
                    Internship.direction.ilike(search),
                    Employer.company_name.ilike(search),
                )
            )

        if city:
            query = query.filter(Internship.city.ilike(f"%{city.strip()}%"))

        if direction:
            query = query.filter(Internship.direction.ilike(f"%{direction.strip()}%"))

        if min_salary is not None:
            query = query.filter(Internship.salary.is_not(None))
            query = query.filter(Internship.salary >= min_salary)

        if max_salary is not None:
            query = query.filter(Internship.salary.is_not(None))
            query = query.filter(Internship.salary <= max_salary)

        return query.order_by(Internship.id.desc()).all()

    def get_public_internship_by_id(self, internship_id: int) -> Internship | None:
        return (
            self.db.query(Internship)
            .options(joinedload(Internship.employer))
            .filter(Internship.id == internship_id)
            .first()
        )

    def save(self, internship: Internship) -> Internship:
        self.db.add(internship)
        self.db.commit()
        self.db.refresh(internship)
        return internship

    def delete_internship(self, internship: Internship) -> None:
        self.db.delete(internship)
        self.db.commit()