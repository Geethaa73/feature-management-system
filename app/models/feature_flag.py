from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    key = Column(
        String(100),
        unique=True,
        nullable=False
    )

    description = Column(
        String(255)
    )

    type = Column(
        String(50)
    )

    enabled = Column(
        Boolean,
        default=True
    )

    release_status = Column(
        String(30),
        default="DRAFT",
        nullable=False
    )

    default_value = Column(
        Boolean,
        default=False
    )

    owner_team = Column(
        String(100)
    )

    rollout_percentage = Column(
        Integer,
        default=100
    )

    target_group_id = Column(
        Integer,
        ForeignKey("groups.id"),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    target_group = relationship(
        "Group"
    )

    overrides = relationship(
        "EnvironmentOverride",
        back_populates="feature_flag",
        cascade="all, delete"
    )

    targeting_rules = relationship(
        "TargetingRule",
        back_populates="feature_flag",
        cascade="all, delete-orphan"
    )
