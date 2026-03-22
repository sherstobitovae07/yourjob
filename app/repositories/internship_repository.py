from sqlalchemy.orm import Session, joinedload

from app.models.employer import Employer
from app.models.enums import InternshipStatus
from app.models.internship import Internship


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

    def get_active_internships(self) -> list[Internship]:
        return (
            self.db.query(Internship)
            .options(joinedload(Internship.employer))
            .filter(Internship.status == InternshipStatus.ACTIVE)
            .order_by(Internship.id.desc())
            .all()
        )

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