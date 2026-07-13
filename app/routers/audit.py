from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.audit_log import AuditLogResponse
from app.services.audit_service import get_all_logs

router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"]
)


@router.get("/", response_model=list[AuditLogResponse])
def list_logs(db: Session = Depends(get_db)):
    return get_all_logs(db)