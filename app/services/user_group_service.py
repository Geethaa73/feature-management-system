from sqlalchemy.orm import Session

from app.models.user_group import UserGroup
from app.models.user import User
from app.models.group import Group
from app.schemas.user_group import UserGroupCreate


def assign_user_to_group(db: Session, assignment: UserGroupCreate):

    user = db.query(User).filter(
        User.id == assignment.user_id
    ).first()

    group = db.query(Group).filter(
        Group.id == assignment.group_id
    ).first()

    if not user or not group:
        return None

    existing = db.query(UserGroup).filter(
        UserGroup.user_id == assignment.user_id,
        UserGroup.group_id == assignment.group_id
    ).first()

    if existing:
        return existing

    user_group = UserGroup(
        user_id=assignment.user_id,
        group_id=assignment.group_id
    )

    db.add(user_group)
    db.commit()
    db.refresh(user_group)

    return user_group


def get_user_groups(db: Session, user_id: int):

    return db.query(UserGroup).filter(
        UserGroup.user_id == user_id
    ).all()


def get_group_members(db: Session, group_id: int):

    return db.query(UserGroup).filter(
        UserGroup.group_id == group_id
    ).all()


def remove_assignment(db: Session, assignment_id: int):

    assignment = db.query(UserGroup).filter(
        UserGroup.id == assignment_id
    ).first()

    if not assignment:
        return None

    db.delete(assignment)
    db.commit()

    return assignment