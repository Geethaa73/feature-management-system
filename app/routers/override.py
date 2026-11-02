from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.override import (
    OverrideCreate,
    OverrideUpdate,
    OverrideResponse,
)

from app.services.override_service import (
    create_override,
    get_all_overrides,
    get_override,
    update_override,
    delete_override,
)

from app.auth.permissions import viewer_required


router = APIRouter(
    prefix="/overrides",
    tags=["Environment Overrides"],
)


@router.post(
    "/",
    response_model=OverrideResponse,
)
def add_override(
    override: OverrideCreate,
    db: Session = Depends(get_db),
    current_user=Depends(viewer_required),
):
    return create_override(
        db,
        override,
        performed_by=current_user.email,
    )


@router.get(
    "/",
    response_model=list[OverrideResponse],
)
def list_overrides(
    db: Session = Depends(get_db),
    current_user=Depends(viewer_required),
):
    return get_all_overrides(db)


@router.get(
    "/{override_id}",
    response_model=OverrideResponse,
)
def get_single_override(
    override_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(viewer_required),
):
    override = get_override(
        db,
        override_id,
    )

    if not override:
        raise HTTPException(
            status_code=404,
            detail="Override not found",
        )

    return override


@router.put(
    "/{override_id}",
    response_model=OverrideResponse,
)
def update_existing_override(
    override_id: int,
    override_data: OverrideUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(viewer_required),
):
    override = update_override(
        db,
        override_id,
        override_data,
        performed_by=current_user.email,
    )

    if not override:
        raise HTTPException(
            status_code=404,
            detail="Override not found",
        )

    return override


@router.delete(
    "/{override_id}",
)
def remove_override(
    override_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(viewer_required),
):
    override = delete_override(
        db,
        override_id,
        performed_by=current_user.email,
    )

    if not override:
        raise HTTPException(
            status_code=404,
            detail="Override not found",
        )

    return {
        "message": "Override deleted successfully"
    }