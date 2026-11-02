from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class UserOverride(Base):
    __tablename__ = "user_overrides"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    feature_id = Column(
        Integer,
        ForeignKey("feature_flags.id", ondelete="CASCADE"),
        nullable=False
    )

    enabled = Column(Boolean, nullable=False)

    user = relationship("User")
    feature = relationship("FeatureFlag")