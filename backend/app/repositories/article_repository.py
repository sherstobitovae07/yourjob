from sqlalchemy.orm import Session
from app.models.article import Article


class ArticleRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
            self,
            author_id: int,
            title: str,
            content: str,
            is_published: bool,
    ) -> Article:
        article = Article(
            author_id=author_id,
            title=title,
            content=content,
            is_published=is_published,
        )

        self.db.add(article)
        self.db.commit()
        self.db.refresh(article)

        return article
    def get_all_published(self):
        return (
            self.db.query(Article)
            .filter(Article.is_published == True)
            .order_by(Article.id.desc())
            .all()
        )

    def get_by_id(self, article_id: int):
        return self.db.query(Article).filter(Article.id == article_id).first()

    def save(self, article: Article):
        self.db.add(article)
        self.db.commit()
        self.db.refresh(article)
        return article

    def get_pending(self):
        return (
            self.db.query(Article)
            .filter(Article.is_published == False)
            .order_by(Article.id.desc())
            .all()
        )

    def get_pending_by_author(self, author_id: int):
        return (
            self.db.query(Article)
            .filter(Article.is_published == False)
            .filter(Article.author_id == author_id)
            .order_by(Article.id.desc())
            .all()
        )

    def delete(self, article):
        self.db.delete(article)
        self.db.commit()