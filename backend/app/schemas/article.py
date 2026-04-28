from datetime import datetime
from pydantic import BaseModel, Field


class ArticleCreateRequest(BaseModel):
    title: str = Field(..., max_length=255)
    content: str


class ArticleResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime