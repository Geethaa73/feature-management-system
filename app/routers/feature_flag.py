from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.feature_flag import (
    FeatureFlagCreate,
    FeatureFlagResponse,
)
from app.schemas.rollout import RolloutPercentageUpdate

from app.services.feature_service import (
    create_feature_flag,
    get_all_feature_flags,
    get_feature_flag,
    delete_feature_flag,
    update_feature_flag,
    toggle_feature_flag,
)

from app.services.redis_service import delete_flag_cache
from app.services.audit_service import create_audit_log

from app.auth.permissions import (
    admin_required,
    developer_required,
    viewer_required,
)


router = APIRouter(
    prefix="/feature-flags",
    tags=["Feature Flags"],
)


@router.post(
    "/",
    response_model=FeatureFlagResponse,
)
def add_feature(
    feature: FeatureFlagCreate,
    db: Session = Depends(get_db),
    current_user=Depends(developer_required),
):
    print("Reached add_feature")
    print(feature)

    print("===== Reached add_feature API =====")
    print(feature)

    return create_feature_flag(
        db,
        feature,
        performed_by=current_user.email,
    )


@router.get(
    "/",
    response_model=list[FeatureFlagResponse],
)
def list_features(
    db: Session = Depends(get_db),
    current_user=Depends(viewer_required),
):
    return get_all_feature_flags(db)


@router.get(
    "/{feature_id}",
    response_model=FeatureFlagResponse,
)
def get_feature(
    feature_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(viewer_required),
):
    feature = get_feature_flag(
        db,
        feature_id,
    )

    if not feature:
        raise HTTPException(
            status_code=404,
            detail="Feature not found",
        )

    return feature


@router.put(
    "/{feature_id}",
    response_model=FeatureFlagResponse,
)
def update_feature(
    feature_id: int,
    feature: FeatureFlagCreate,
    db: Session = Depends(get_db),
    current_user=Depends(developer_required),
):
    updated = update_feature_flag(
        db,
        feature_id,
        feature,
        performed_by=current_user.email,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Feature not found",
        )

    return updated


@router.patch(
    "/{feature_id}/toggle",
    response_model=FeatureFlagResponse,
)
def toggle_feature(
    feature_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(developer_required),
):
    updated = toggle_feature_flag(
        db,
        feature_id,
        performed_by=current_user.email,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Feature not found",
        )

    return updated


@router.patch(
    "/{feature_id}/rollout",
    response_model=FeatureFlagResponse,
)
def update_rollout(
    feature_id: int,
    rollout: RolloutPercentageUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(developer_required),
):
    feature = get_feature_flag(
        db,
        feature_id,
    )

    if not feature:
        raise HTTPException(
            status_code=404,
            detail="Feature not found",
        )

    old_rollout_percentage = feature.rollout_percentage
    new_rollout_percentage = rollout.rollout_percentage

    feature.rollout_percentage = new_rollout_percentage

    db.commit()
    db.refresh(feature)

    # Clear cached evaluations because
    # the rollout percentage has changed.
    delete_flag_cache(feature.key)

    # Record rollout change
    create_audit_log(
        db,
        action="ROLLOUT_CHANGED",
        performed_by=current_user.email,
        flag_id=feature.id,
        environment_id=None,
        old_value=f"Rollout: {old_rollout_percentage}%",
        new_value=f"Rollout: {new_rollout_percentage}%",
    )

    return feature


@router.delete(
    "/{feature_id}"
)
def remove_feature(
    feature_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(admin_required),
):
    feature = delete_feature_flag(
        db,
        feature_id,
        performed_by=current_user.email,
    )

    if not feature:
        raise HTTPException(
            status_code=404,
            detail="Feature not found",
        )

    return {
        "message": "Feature deleted successfully"
    }