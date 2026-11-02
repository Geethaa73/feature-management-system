from sqlalchemy.orm import Session

from app.models.feature_flag import FeatureFlag
from app.schemas.feature_flag import FeatureFlagCreate
from app.services.audit_service import create_audit_log
from app.services.redis_service import delete_flag_cache


def create_feature_flag(
    db: Session,
    feature: FeatureFlagCreate,
    performed_by: str,
):

    print("===== Inside create_feature_flag =====")
    print(feature)

    db_feature = FeatureFlag(
        key=feature.key,
        description=feature.description,
        type=feature.type,
        enabled=feature.enabled,
        default_value=feature.default_value,
        owner_team=feature.owner_team,
        rollout_percentage=feature.rollout_percentage,
        target_group_id=feature.target_group_id,
    )

    print("Feature object created")

    db.add(db_feature)
    print("Added to session")

    db.commit()
    print("Committed to database")

    db.refresh(db_feature)

    create_audit_log(
        db,
        action="CREATE_FEATURE",
        performed_by=performed_by,
        flag_id=db_feature.id,
        old_value=None,
        new_value=f"Created feature '{db_feature.key}'",
    )

    print("Refreshed object")

    return db_feature


def get_all_feature_flags(db: Session):
    return db.query(FeatureFlag).all()


def get_feature_flag(
    db: Session,
    feature_id: int,
):
    return (
        db.query(FeatureFlag)
        .filter(FeatureFlag.id == feature_id)
        .first()
    )


def update_feature_flag(
    db: Session,
    feature_id: int,
    feature_data: FeatureFlagCreate,
    performed_by: str,
):
    feature = (
        db.query(FeatureFlag)
        .filter(FeatureFlag.id == feature_id)
        .first()
    )

    if not feature:
        return None

    old_key = feature.key
    old_state = (
        f"key={feature.key}, "
        f"description={feature.description}, "
        f"type={feature.type}, "
        f"enabled={feature.enabled}, "
        f"default_value={feature.default_value}, "
        f"owner_team={feature.owner_team}, "
        f"rollout_percentage={feature.rollout_percentage}, "
        f"target_group_id={feature.target_group_id}"
    )

    feature.key = feature_data.key
    feature.description = feature_data.description
    feature.type = feature_data.type
    feature.enabled = feature_data.enabled
    feature.default_value = feature_data.default_value
    feature.owner_team = feature_data.owner_team
    feature.rollout_percentage = feature_data.rollout_percentage
    feature.target_group_id = feature_data.target_group_id

    new_state = (
        f"key={feature.key}, "
        f"description={feature.description}, "
        f"type={feature.type}, "
        f"enabled={feature.enabled}, "
        f"default_value={feature.default_value}, "
        f"owner_team={feature.owner_team}, "
        f"rollout_percentage={feature.rollout_percentage}, "
        f"target_group_id={feature.target_group_id}"
    )

    db.commit()
    db.refresh(feature)

    delete_flag_cache(old_key)

    if feature.key != old_key:
        delete_flag_cache(feature.key)

    create_audit_log(
        db,
        action="UPDATE_FEATURE",
        performed_by=performed_by,
        flag_id=feature.id,
        old_value=old_state,
        new_value=new_state,
    )

    return feature


def delete_feature_flag(
    db: Session,
    feature_id: int,
    performed_by: str,
):

    feature = get_feature_flag(db, feature_id)

    if feature:

        feature_key = feature.key
        old_state = (
            f"key={feature.key}, "
            f"description={feature.description}, "
            f"type={feature.type}, "
            f"enabled={feature.enabled}, "
            f"default_value={feature.default_value}, "
            f"owner_team={feature.owner_team}, "
            f"rollout_percentage={feature.rollout_percentage}, "
            f"target_group_id={feature.target_group_id}"
        )

        # Store the ID before deletion because the
        # foreign key uses ON DELETE SET NULL.
        feature_id_value = feature.id

        db.delete(feature)
        db.commit()

        delete_flag_cache(feature_key)

        create_audit_log(
            db,
            action="DELETE_FEATURE",
            performed_by=performed_by,
            flag_id=None,
            old_value=old_state,
            new_value=f"Feature '{feature_key}' deleted",
        )

        # Keep the deleted flag ID unavailable because
        # the database correctly sets flag_id to NULL.
        _ = feature_id_value

    return feature


def toggle_feature_flag(
    db: Session,
    feature_id: int,
    performed_by: str,
):

    feature = get_feature_flag(db, feature_id)

    if not feature:
        return None

    old_status = feature.enabled

    feature.enabled = not feature.enabled

    db.commit()
    db.refresh(feature)

    delete_flag_cache(feature.key)

    create_audit_log(
        db,
        action="TOGGLE_FEATURE",
        performed_by=performed_by,
        flag_id=feature.id,
        old_value=(
            "Enabled"
            if old_status
            else "Disabled"
        ),
        new_value=(
            "Enabled"
            if feature.enabled
            else "Disabled"
        ),
    )

    return feature