from datetime import datetime

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: int
    action: str
    performed_by: str

    flag_id: int | None = None
    environment_id: int | None = None

    old_value: str | None = None
    new_value: str | None = None

    timestamp: datetime

    class Config:
        from_attributes = True