from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    action = Column(String(100), nullable=False)
    performed_by = Column(String(100), nullable=False)

    flag_id = Column(
        Integer,
        ForeignKey("feature_flags.id", ondelete="SET NULL"),
        nullable=True,
    )

    environment_id = Column(
        Integer,
        ForeignKey("environments.id", ondelete="SET NULL"),
        nullable=True,
    )

    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)

    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=True,
    )