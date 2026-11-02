from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.audit_log import AuditLogResponse
from app.services.audit_service import (
    get_all_logs,
    get_audit_log,
)


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


@router.get(
    "/",
    response_model=list[AuditLogResponse],
)
def list_logs(
    flag_id: int | None = Query(
        default=None,
        description="Filter by feature flag ID",
    ),
    performed_by: str | None = Query(
        default=None,
        description="Filter by user email",
    ),
    action: str | None = Query(
        default=None,
        description="Filter by audit action",
    ),
    start_date: datetime | None = Query(
        default=None,
        description="Return logs from this date/time onward",
    ),
    end_date: datetime | None = Query(
        default=None,
        description="Return logs up to this date/time",
    ),
    db: Session = Depends(get_db),
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date cannot be later than end_date",
        )

    return get_all_logs(
        db=db,
        flag_id=flag_id,
        performed_by=performed_by,
        action=action,
        start_date=start_date,
        end_date=end_date,
    )


@router.get(
    "/{log_id}",
    response_model=AuditLogResponse,
)
def get_log(
    log_id: int,
    db: Session = Depends(get_db),
):
    log = get_audit_log(
        db=db,
        log_id=log_id,
    )

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Audit log not found",
        )

    return log