from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.services.article_service import ArticleService
from app.schemas.article import ArticleCreateRequest, ArticleResponse
from app.models.user import User

router = APIRouter(prefix="/articles", tags=["Articles"])


@router.post("", response_model=ArticleResponse)
def create_article(
    data: ArticleCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ArticleService(db)
    return service.create_article(current_user, data)

@router.get("", response_model=list[ArticleResponse])
def get_articles(db: Session = Depends(get_db)):
    service = ArticleService(db)
    return service.get_articles()


@router.patch("/{article_id}/publish")
def publish_article(
    article_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ArticleService(db)
    return service.publish_article(current_user, article_id)

@router.get("/pending", response_model=list[ArticleResponse])
def get_pending_articles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ArticleService(db)
    return service.get_pending_articles(current_user)

@router.delete("/{article_id}")
def delete_article(
    article_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ArticleService(db)
    return service.delete_article(current_user, article_id)