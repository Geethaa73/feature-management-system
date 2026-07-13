from pydantic import BaseModel
from datetime import datetime


class OverrideCreate(BaseModel):
    feature_flag_id: int
    environment_id: int
    is_enabled: bool


class OverrideResponse(BaseModel):
    id: int
    feature_flag_id: int
    environment_id: int
    is_enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True