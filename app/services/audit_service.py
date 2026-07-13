from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


def get_all_logs(db: Session):
    return db.query(AuditLog).all()