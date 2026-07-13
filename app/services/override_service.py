from sqlalchemy.orm import Session
from app.models.override import EnvironmentOverride
from app.schemas.override import OverrideCreate


def create_override(db: Session, override: OverrideCreate):
    db_override = EnvironmentOverride(
        feature_flag_id=override.feature_flag_id,
        environment_id=override.environment_id,
        is_enabled=override.is_enabled
    )

    db.add(db_override)
    db.commit()
    db.refresh(db_override)

    return db_override


def get_all_overrides(db: Session):
    return db.query(EnvironmentOverride).all()
