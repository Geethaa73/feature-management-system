from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.base import Base


class EvaluationLog(Base):
    __tablename__ = "evaluation_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

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

    user_id = Column(
        String(100),
        nullable=True,
    )

    enabled = Column(
        Boolean,
        nullable=False,
    )

    reason = Column(
        String(100),
        nullable=True,
    )

    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )