from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.user_override import (
    UserOverrideCreate,
    UserOverrideResponse
)
from app.services.user_override_service import (
    create_override,
    get_all_overrides,
    delete_override
)

router = APIRouter(
    prefix="/user-overrides",
    tags=["User Overrides"]
)


@router.post("/", response_model=UserOverrideResponse)
def add_override(
    override: UserOverrideCreate,
    db: Session = Depends(get_db)
):
    return create_override(db, override)


@router.get("/", response_model=list[UserOverrideResponse])
def list_overrides(
    db: Session = Depends(get_db)
):
    return get_all_overrides(db)


@router.delete("/{override_id}")
def remove_override(
    override_id: int,
    db: Session = Depends(get_db)
):
    deleted = delete_override(db, override_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Override not found"
        )

    return {"message": "Deleted successfully"}