from pydantic import BaseModel
from datetime import datetime


class EnvironmentCreate(BaseModel):
    name: str
    description: str | None = None


class EnvironmentResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True