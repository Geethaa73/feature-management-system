from pydantic import BaseModel
from datetime import datetime


class FeatureFlagCreate(BaseModel):
    key: str
    description: str | None = None
    type: str
    enabled: bool = True
    default_value: bool = False
    owner_team: str
    rollout_percentage: int = 100
    target_group_id: int | None = None


class FeatureFlagResponse(BaseModel):
    id: int
    key: str
    description: str | None
    type: str
    enabled: bool
    release_status: str
    default_value: bool
    owner_team: str
    rollout_percentage: int
    target_group_id: int | None
    created_at: datetime

    class Config:
        from_attributes = True