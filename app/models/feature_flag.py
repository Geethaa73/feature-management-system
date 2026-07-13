from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    description = Column(String(255))
    type = Column(String(50))
    default_value = Column(Boolean, default=False)
    enabled = Column(Boolean, default=True)
    owner_team = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    overrides = relationship(
        "EnvironmentOverride",
        back_populates="feature_flag",
        cascade="all, delete"
    )