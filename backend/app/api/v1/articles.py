from fastapi import APIRouter, Depends, Body, Path
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.services.article_service import ArticleService
from app.schemas.article import ArticleCreateRequest, ArticleResponse
from app.models.user import User

router = APIRouter(prefix="/articles", tags=["Articles"])


@router.post(
    "",
    response_model=ArticleResponse,
    summary="Создание статьи",
    description="Создает статью с полезной информацией для пользователей.",
    response_description="Данные созданной статьи",
)
def create_article(
    data: ArticleCreateRequest = Body(
        example={
            "title": "Как подготовиться к стажировке",
            "content": "Перед подачей отклика необходимо обновить резюме и изучить требования компании.",
        }
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ArticleService(db)
    return service.create_article(current_user, data)


@router.get(
    "",
    response_model=list[ArticleResponse],
    summary="Список статей",
    description="Возвращает список опубликованных статей.",
    response_description="Список статей",
)
def get_articles(db: Session = Depends(get_db)):
    service = ArticleService(db)
    return service.get_articles()


@router.patch(
    "/{article_id}/publish",
    summary="Публикация статьи",
    description="Публикует статью после проверки администратором.",
    response_description="Результат публикации статьи",
)
def publish_article(
    article_id: int = Path(description="ID статьи"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ArticleService(db)
    return service.publish_article(current_user, article_id)


@router.get(
    "/pending",
    response_model=list[ArticleResponse],
    summary="Статьи на проверке",
    description="Возвращает список статей, ожидающих публикации.",
    response_description="Список статей на проверке",
)
def get_pending_articles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ArticleService(db)
    return service.get_pending_articles(current_user)


@router.delete(
    "/{article_id}",
    summary="Удаление статьи",
    description="Удаляет выбранную статью.",
    response_description="Результат удаления статьи",
)
def delete_article(
    article_id: int = Path(description="ID статьи"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ArticleService(db)
    return service.delete_article(current_user, article_id)