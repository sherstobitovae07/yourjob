import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status


class FileService:
    BASE_DIR = Path("media")
    STUDENTS_DIR = BASE_DIR / "students"
    EMPLOYERS_DIR = BASE_DIR / "employers"
    INTERNSHIPS_DIR = BASE_DIR / "internships"
    RESUMES_DIR = BASE_DIR / "resumes"

    IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/jpg"}
    PDF_CONTENT_TYPE = "application/pdf"

    MAX_IMAGE_SIZE = 5 * 1024 * 1024      # 5 MB
    MAX_RESUME_SIZE = 10 * 1024 * 1024    # 10 MB

    @classmethod
    def ensure_dirs(cls) -> None:
        cls.STUDENTS_DIR.mkdir(parents=True, exist_ok=True)
        cls.EMPLOYERS_DIR.mkdir(parents=True, exist_ok=True)
        cls.INTERNSHIPS_DIR.mkdir(parents=True, exist_ok=True)
        cls.RESUMES_DIR.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _generate_filename(original_filename: str) -> str:
        extension = Path(original_filename).suffix.lower()
        return f"{uuid.uuid4()}{extension}"

    @staticmethod
    async def _read_file(file: UploadFile) -> bytes:
        content = await file.read()
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Файл пустой",
            )
        return content

    @classmethod
    async def save_student_photo(cls, file: UploadFile) -> str:
        return await cls._save_image(file, cls.STUDENTS_DIR)

    @classmethod
    async def save_employer_photo(cls, file: UploadFile) -> str:
        return await cls._save_image(file, cls.EMPLOYERS_DIR)

    @classmethod
    async def save_internship_photo(cls, file: UploadFile) -> str:
        return await cls._save_image(file, cls.INTERNSHIPS_DIR)

    @classmethod
    async def save_resume_pdf(cls, file: UploadFile) -> str:
        if file.content_type != cls.PDF_CONTENT_TYPE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Резюме должно быть в формате PDF",
            )

        content = await cls._read_file(file)

        if len(content) > cls.MAX_RESUME_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Размер резюме не должен превышать 10 МБ",
            )

        filename = cls._generate_filename(file.filename or "resume.pdf")
        file_path = cls.RESUMES_DIR / filename

        with open(file_path, "wb") as f:
            f.write(content)

        return str(file_path).replace("\\", "/")

    @classmethod
    async def _save_image(cls, file: UploadFile, directory: Path) -> str:
        if file.content_type not in cls.IMAGE_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Допустимы только изображения JPG и PNG",
            )

        content = await cls._read_file(file)

        if len(content) > cls.MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Размер изображения не должен превышать 5 МБ",
            )

        filename = cls._generate_filename(file.filename or "image.jpg")
        file_path = directory / filename

        with open(file_path, "wb") as f:
            f.write(content)

        return str(file_path).replace("\\", "/")

    @staticmethod
    def delete_file(file_path: str | None) -> None:
        if not file_path:
            return

        path = Path(file_path)
        if path.exists() and path.is_file():
            os.remove(path)