from sqlalchemy.orm import Session

from app.models.feature_flag import FeatureFlag
from app.services.audit_service import create_audit_log
from app.services.redis_service import delete_flag_cache


ALLOWED_STATUSES = {
    "DRAFT",
    "ACTIVE",
    "ROLLOUT",
    "FULL_RELEASE",
    "DISABLED",
}


VALID_TRANSITIONS = {
    "DRAFT": {"ACTIVE", "DISABLED"},
    "ACTIVE": {"ROLLOUT", "FULL_RELEASE", "DISABLED"},
    "ROLLOUT": {"FULL_RELEASE", "DISABLED"},
    "FULL_RELEASE": {"DISABLED"},
    "DISABLED": {"DRAFT", "ACTIVE"},
}


def get_feature_for_release(
    db: Session,
    feature_flag_id: int,
):
    return (
        db.query(FeatureFlag)
        .filter(
            FeatureFlag.id == feature_flag_id
        )
        .first()
    )


def update_release_status(
    db: Session,
    feature_flag_id: int,
    new_status: str,
    performed_by: str,
):
    feature = get_feature_for_release(
        db,
        feature_flag_id,
    )

    if not feature:
        return None, "Feature flag not found"

    new_status = new_status.strip().upper()

    if new_status not in ALLOWED_STATUSES:
        return None, (
            "Invalid release status. "
            "Allowed statuses: "
            "DRAFT, ACTIVE, ROLLOUT, FULL_RELEASE, DISABLED"
        )

    current_status = (
        feature.release_status or "DRAFT"
    ).upper()

    if current_status == new_status:
        return feature, None

    allowed_next_statuses = VALID_TRANSITIONS.get(
        current_status,
        set(),
    )

    if new_status not in allowed_next_statuses:
        return None, (
            f"Invalid release transition: "
            f"{current_status} -> {new_status}"
        )

    old_state = (
        f"release_status={current_status}, "
        f"enabled={feature.enabled}, "
        f"rollout_percentage={feature.rollout_percentage}"
    )

    feature.release_status = new_status

    # Keep the existing feature evaluation behavior
    # consistent with the release lifecycle.
    if new_status == "DISABLED":
        feature.enabled = False

    elif new_status == "FULL_RELEASE":
        feature.enabled = True
        feature.rollout_percentage = 100

    elif new_status == "ROLLOUT":
        feature.enabled = True

    elif new_status == "ACTIVE":
        feature.enabled = True

    new_state = (
        f"release_status={feature.release_status}, "
        f"enabled={feature.enabled}, "
        f"rollout_percentage={feature.rollout_percentage}"
    )

    db.commit()
    db.refresh(feature)

    # Release changes can affect feature evaluation.
    delete_flag_cache(feature.key)

    create_audit_log(
        db,
        action="RELEASE_STATUS_CHANGED",
        performed_by=performed_by,
        flag_id=feature.id,
        environment_id=None,
        old_value=old_state,
        new_value=new_state,
    )

    return feature, None