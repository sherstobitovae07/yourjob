from fastapi import HTTPException, status
from app.models.enums import UserRole
from app.repositories.article_repository import ArticleRepository
from app.schemas.article import ArticleResponse


class ArticleService:
    def __init__(self, db):
        self.repository = ArticleRepository(db)

    def create_article(self, current_user, data):
        if current_user.role not in (UserRole.ADMIN, UserRole.EMPLOYER):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Создавать статьи могут только администраторы и работодатели",
            )

        is_published = current_user.role == UserRole.ADMIN

        article = self.repository.create(
            author_id=current_user.id,
            title=data.title,
            content=data.content,
            is_published=is_published,
        )

        return ArticleResponse(
            id=article.id,
            title=article.title,
            content=article.content,
            created_at=article.created_at,
        )

    def publish_article(self, current_user, article_id):
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(403, "Публиковать статьи может только администратор")

        article = self.repository.get_by_id(article_id)
        if not article:
            raise HTTPException(404, "Статья не найдена")

        article.is_published = True
        self.repository.save(article)

        return {"message": "Статья опубликована"}

    def get_articles(self):
        articles = self.repository.get_all_published()
        return [
            ArticleResponse(
                id=a.id,
                title=a.title,
                content=a.content,
                created_at=a.created_at,
            )
            for a in articles
        ]

    def get_pending_articles(self, current_user):
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(403, "Доступ только для администратора")

        articles = self.repository.get_pending()

        return [
            ArticleResponse(
                id=a.id,
                title=a.title,
                content=a.content,
                created_at=a.created_at,
            )
            for a in articles

        ]

    def delete_article(self, current_user, article_id):
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(403, "Удалять статьи может только администратор")

        article = self.repository.get_by_id(article_id)
        if not article:
            raise HTTPException(404, "Статья не найдена")

        self.repository.delete(article)

        return {"message": "Статья удалена"}