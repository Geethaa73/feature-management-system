from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.user_group import (
    UserGroupCreate,
    UserGroupResponse
)

from app.services.user_group_service import (
    assign_user_to_group,
    get_user_groups,
    get_group_members,
    remove_assignment
)


router = APIRouter(
    prefix="/user-groups",
    tags=["User Groups"]
)


@router.post("/assign", response_model=UserGroupResponse)
def assign(
    assignment: UserGroupCreate,
    db: Session = Depends(get_db)
):
    result = assign_user_to_group(db, assignment)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="User or Group not found"
        )

    return result


@router.get(
    "/user/{user_id}",
    response_model=list[UserGroupResponse]
)
def get_groups(
    user_id: int,
    db: Session = Depends(get_db)
):
    return get_user_groups(db, user_id)


@router.get(
    "/group/{group_id}",
    response_model=list[UserGroupResponse]
)
def get_members(
    group_id: int,
    db: Session = Depends(get_db)
):
    return get_group_members(db, group_id)


@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db)
):
    deleted = remove_assignment(db, assignment_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    return {
        "message": "Assignment removed successfully"
    }