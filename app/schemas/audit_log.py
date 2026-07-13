from pydantic import BaseModel
from datetime import datetime


class AuditLogResponse(BaseModel):
    id: int
    action: str
    entity: str
    entity_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True