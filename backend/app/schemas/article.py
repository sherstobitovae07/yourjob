from datetime import datetime
from pydantic import BaseModel, Field


class ArticleCreateRequest(BaseModel):
    title: str = Field(..., max_length=255)
    content: str


class ArticleResponse(BaseModel):
    id: int
    title: str
    content: str
    author_id: int | None = None
    author_name: str | None = None
    published: bool = False
    created_at: datetime