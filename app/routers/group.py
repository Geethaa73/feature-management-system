from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.group import (
    GroupCreate,
    GroupResponse
)

from app.services.group_service import (
    create_group,
    get_all_groups,
    get_group,
    update_group,
    delete_group
)

router = APIRouter(
    prefix="/groups",
    tags=["Groups"]
)


@router.post("/", response_model=GroupResponse)
def add_group(
    group: GroupCreate,
    db: Session = Depends(get_db)
):
    return create_group(db, group)


@router.get("/", response_model=list[GroupResponse])
def list_groups(
    db: Session = Depends(get_db)
):
    return get_all_groups(db)


@router.get("/{group_id}", response_model=GroupResponse)
def fetch_group(
    group_id: int,
    db: Session = Depends(get_db)
):
    group = get_group(db, group_id)

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    return group


@router.put("/{group_id}", response_model=GroupResponse)
def edit_group(
    group_id: int,
    group: GroupCreate,
    db: Session = Depends(get_db)
):
    updated = update_group(db, group_id, group)

    if not updated:
        raise HTTPException(status_code=404, detail="Group not found")

    return updated


@router.delete("/{group_id}")
def remove_group(
    group_id: int,
    db: Session = Depends(get_db)
):
    deleted = delete_group(db, group_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Group not found")

    return {
        "message": "Group deleted successfully"
    }