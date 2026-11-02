from datetime import datetime

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    action: str,
    performed_by: str,
    flag_id: int | None = None,
    environment_id: int | None = None,
    old_value: str | None = None,
    new_value: str | None = None,
):
    """
    Create an audit log entry.

    Records:
    - who performed the action
    - what action was performed
    - which feature flag was affected
    - which environment was affected
    - previous state
    - new state
    """

    log = AuditLog(
        action=action,
        performed_by=performed_by,
        flag_id=flag_id,
        environment_id=environment_id,
        old_value=old_value,
        new_value=new_value,
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log


def get_all_logs(
    db: Session,
    flag_id: int | None = None,
    performed_by: str | None = None,
    action: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """
    Return audit logs with optional filters.
    """

    query = db.query(AuditLog)

    if flag_id is not None:
        query = query.filter(
            AuditLog.flag_id == flag_id
        )

    if performed_by:
        query = query.filter(
            AuditLog.performed_by.ilike(
                f"%{performed_by.strip()}%"
            )
        )

    if action:
        query = query.filter(
            AuditLog.action == action.strip()
        )

    if start_date:
        query = query.filter(
            AuditLog.timestamp >= start_date
        )

    if end_date:
        query = query.filter(
            AuditLog.timestamp <= end_date
        )

    return (
        query
        .order_by(AuditLog.timestamp.desc())
        .all()
    )


def get_audit_log(
    db: Session,
    log_id: int,
):
    """
    Return one audit log by ID.
    """

    return (
        db.query(AuditLog)
        .filter(AuditLog.id == log_id)
        .first()
    )