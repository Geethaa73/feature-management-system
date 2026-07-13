from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class EnvironmentOverride(Base):
    __tablename__ = "environment_overrides"

    id = Column(Integer, primary_key=True, index=True)

    flag_id = Column(
        Integer,
        ForeignKey("feature_flags.id", ondelete="CASCADE"),
        nullable=False
    )

    environment_id = Column(
        Integer,
        ForeignKey("environments.id", ondelete="CASCADE"),
        nullable=False
    )

    value = Column(Boolean, nullable=False)

    feature_flag = relationship(
        "FeatureFlag",
        back_populates="overrides"
    )

    environment = relationship(
        "Environment",
        back_populates="overrides"
    )