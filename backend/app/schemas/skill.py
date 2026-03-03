from datetime import datetime
from pydantic import BaseModel

from app.schemas.user import UserResponse


class SkillCreate(BaseModel):
    name: str
    description: str


class SkillResponse(BaseModel):
    id: int
    name: str
    description: str
    author_id: int
    author: UserResponse | None = None
    download_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SkillListResponse(BaseModel):
    items: list[SkillResponse]
    total: int
    page: int
    page_size: int
