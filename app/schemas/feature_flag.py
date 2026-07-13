from pydantic import BaseModel
from datetime import datetime


class FeatureFlagCreate(BaseModel):
    name: str
    description: str | None = None
    is_enabled: bool = False
    environment_id: int


class FeatureFlagResponse(BaseModel):
    id: int
    name: str
    description: str | None
    is_enabled: bool
    environment_id: int
    created_at: datetime

    class Config:
        from_attributes = True