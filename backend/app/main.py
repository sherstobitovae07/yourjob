from fastapi import FastAPI

from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router
from app.api.v1.internships import router as internships_router
from app.api.v1.applications import router as applications_router
from app.core.database import Base, engine
from app.models import User, Student, Employer, Admin, Internship, Application, Report


app = FastAPI(
    title="Your Job API",
    version="1.0.0"
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth_router, prefix="/api/v1")
app.include_router(profile_router, prefix="/api/v1")
app.include_router(internships_router, prefix="/api/v1")
app.include_router(applications_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Your Job backend is running"}