from urllib.parse import quote_plus
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings

print("USER:", repr(settings.POSTGRES_USER))
print("PASSWORD:", repr(settings.POSTGRES_PASSWORD))
print("DB:", repr(settings.POSTGRES_DB))
print("HOST:", repr(settings.POSTGRES_HOST))
print("PORT:", repr(settings.POSTGRES_PORT))

DATABASE_URL = (
    f"postgresql://{quote_plus(settings.POSTGRES_USER)}:"
    f"{quote_plus(settings.POSTGRES_PASSWORD)}@"
    f"{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/"
    f"{quote_plus(settings.POSTGRES_DB)}"
)

print("DB URL:", repr(DATABASE_URL))

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()