from fastapi import FastAPI
from sqlalchemy import text

from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router
from app.api.v1.internships import router as internships_router
from app.api.v1.applications import router as applications_router
from app.core.database import Base, engine
from app.models import User, Student, Employer, Admin, Internship, Application, Report
from app.api.v1.admin import router as admin_router
from app.api.v1.reports import router as reports_router
from fastapi.staticfiles import StaticFiles
from app.services.file_service import FileService


app = FastAPI(
    title="Your Job API",
    version="1.0.0"
)
FileService.ensure_dirs()
app.mount("/media", StaticFiles(directory="media"), name="media")

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    # Ensure DB schema matches models when migrations aren't used.
    # Add `photo_path` column to `students` table if it's missing.
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_path VARCHAR(500);"))
            # If enum type is missing or mismatched, create a varchar fallback column
            conn.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50);"))
            conn.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS verification_comment TEXT;"))
            conn.commit()
        except Exception:
            # Don't fail startup for schema adjustment errors; log is shown by engine
            pass


app.include_router(auth_router, prefix="/api/v1")
app.include_router(profile_router, prefix="/api/v1")
app.include_router(internships_router, prefix="/api/v1")
app.include_router(applications_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Your Job backend is running"}