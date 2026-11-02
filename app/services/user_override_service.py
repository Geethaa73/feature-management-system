from sqlalchemy.orm import Session

from app.models.user_override import UserOverride
from app.schemas.user_override import UserOverrideCreate


def create_override(db: Session, override: UserOverrideCreate):

    db_override = UserOverride(
        user_id=override.user_id,
        feature_id=override.feature_id,
        enabled=override.enabled
    )

    db.add(db_override)
    db.commit()
    db.refresh(db_override)

    return db_override


def get_all_overrides(db: Session):
    return db.query(UserOverride).all()


def delete_override(db: Session, override_id: int):

    obj = db.query(UserOverride).filter(
        UserOverride.id == override_id
    ).first()

    if not obj:
        return None

    db.delete(obj)
    db.commit()

    return obj