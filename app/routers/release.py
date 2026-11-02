from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.auth.permissions import viewer_required

from app.schemas.release import (
    ReleaseStatusUpdate,
    ReleaseStatusResponse,
)

from app.services.release_service import (
    update_release_status,
)


router = APIRouter(
    prefix="/release",
    tags=["Release Control"],
)


@router.patch(
    "/{feature_flag_id}",
    response_model=ReleaseStatusResponse,
)
def change_release_status(
    feature_flag_id: int,
    release: ReleaseStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(viewer_required),
):
    feature, error = update_release_status(
        db,
        feature_flag_id,
        release.release_status,
        performed_by=current_user.email,
    )

    if error:
        if error == "Feature flag not found":
            raise HTTPException(
                status_code=404,
                detail=error,
            )

        raise HTTPException(
            status_code=400,
            detail=error,
        )

    return feature