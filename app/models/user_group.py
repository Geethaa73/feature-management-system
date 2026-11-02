from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class UserGroup(Base):

    __tablename__ = "user_groups"


    id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )


    group_id = Column(
        Integer,
        ForeignKey("groups.id")
    )


    user = relationship(
        "User",
        back_populates="groups"
    )


    group = relationship(
        "Group",
        back_populates="users"
    )