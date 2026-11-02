from sqlalchemy.orm import Session

from app.models.group import Group
from app.schemas.group import GroupCreate


def create_group(db: Session, group: GroupCreate):
    db_group = Group(name=group.name)

    db.add(db_group)
    db.commit()
    db.refresh(db_group)

    return db_group


def get_all_groups(db: Session):
    return db.query(Group).all()


def get_group(db: Session, group_id: int):
    return db.query(Group).filter(Group.id == group_id).first()


def update_group(db: Session, group_id: int, group: GroupCreate):

    db_group = get_group(db, group_id)

    if not db_group:
        return None

    db_group.name = group.name

    db.commit()
    db.refresh(db_group)

    return db_group


def delete_group(db: Session, group_id: int):

    db_group = get_group(db, group_id)

    if not db_group:
        return None

    db.delete(db_group)
    db.commit()

    return db_group