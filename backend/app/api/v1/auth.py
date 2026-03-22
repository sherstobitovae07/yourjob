from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.schemas.auth import (
    EmployerRegisterRequest,
    LoginRequest,
    StudentRegisterRequest,
    TokenResponse,
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register/student", response_model=UserResponse)
def register_student(
    data: StudentRegisterRequest,
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    return service.register_student(data)


@router.post("/register/employer", response_model=UserResponse)
def register_employer(
    data: EmployerRegisterRequest,
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    return service.register_employer(data)


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    token = service.login(data)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_user)):
    return current_user