from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class TargetingRule(Base):
    __tablename__ = "targeting_rules"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    feature_flag_id = Column(
        Integer,
        ForeignKey("feature_flags.id", ondelete="CASCADE"),
        nullable=False
    )

    rule_type = Column(
        String(20),
        nullable=False
    )

    rule_value = Column(
        String(255),
        nullable=False
    )

    feature_flag = relationship(
        "FeatureFlag",
        back_populates="targeting_rules"
    )