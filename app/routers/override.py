from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.override import OverrideCreate, OverrideResponse
from app.services.override_service import (
    create_override,
    get_all_overrides,
)

router = APIRouter(
    prefix="/overrides",
    tags=["Environment Overrides"]
)


@router.post("/", response_model=OverrideResponse)
def add_override(
    override: OverrideCreate,
    db: Session = Depends(get_db)
):
    return create_override(db, override)


@router.get("/", response_model=list[OverrideResponse])
def list_overrides(
    db: Session = Depends(get_db)
):
    return get_all_overrides(db)