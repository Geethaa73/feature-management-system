from sqlalchemy.orm import Session

from app.models.override import EnvironmentOverride
from app.models.feature_flag import FeatureFlag
from app.schemas.override import (
    OverrideCreate,
    OverrideUpdate,
)

from app.services.redis_service import delete_flag_cache
from app.services.audit_service import create_audit_log


def create_override(
    db: Session,
    override: OverrideCreate,
    performed_by: str,
):
    db_override = EnvironmentOverride(
        flag_id=override.flag_id,
        environment_id=override.environment_id,
        value=override.value,
    )

    db.add(db_override)
    db.commit()
    db.refresh(db_override)

    feature = (
        db.query(FeatureFlag)
        .filter(
            FeatureFlag.id == override.flag_id
        )
        .first()
    )

    if feature:
        delete_flag_cache(feature.key)

        create_audit_log(
            db,
            action="OVERRIDE_CHANGED",
            performed_by=performed_by,
            flag_id=feature.id,
            environment_id=override.environment_id,
            old_value=None,
            new_value=f"Override value: {override.value}",
        )

    return db_override


def get_all_overrides(db: Session):
    return db.query(
        EnvironmentOverride
    ).all()


def get_override(
    db: Session,
    override_id: int,
):
    return (
        db.query(EnvironmentOverride)
        .filter(
            EnvironmentOverride.id == override_id
        )
        .first()
    )


def update_override(
    db: Session,
    override_id: int,
    override_data: OverrideUpdate,
    performed_by: str,
):
    override = get_override(
        db,
        override_id,
    )

    if not override:
        return None

    old_value = override.value

    override.value = override_data.value

    db.commit()
    db.refresh(override)

    feature = (
        db.query(FeatureFlag)
        .filter(
            FeatureFlag.id == override.flag_id
        )
        .first()
    )

    if feature:
        delete_flag_cache(feature.key)

        create_audit_log(
            db,
            action="OVERRIDE_CHANGED",
            performed_by=performed_by,
            flag_id=override.flag_id,
            environment_id=override.environment_id,
            old_value=f"Override value: {old_value}",
            new_value=f"Override value: {override.value}",
        )

    return override


def delete_override(
    db: Session,
    override_id: int,
    performed_by: str,
):
    override = get_override(
        db,
        override_id,
    )

    if not override:
        return None

    feature = (
        db.query(FeatureFlag)
        .filter(
            FeatureFlag.id == override.flag_id
        )
        .first()
    )

    old_value = override.value
    flag_id = override.flag_id
    environment_id = override.environment_id

    db.delete(override)
    db.commit()

    if feature:
        delete_flag_cache(feature.key)

        create_audit_log(
            db,
            action="OVERRIDE_CHANGED",
            performed_by=performed_by,
            flag_id=flag_id,
            environment_id=environment_id,
            old_value=f"Override value: {old_value}",
            new_value="Override deleted",
        )

    return override