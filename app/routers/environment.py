from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.environment import (
    EnvironmentCreate,
    EnvironmentResponse,
)

from app.services.environment_service import (
    create_environment,
    get_all_environments,
    get_environment,
    update_environment,
    delete_environment,
)


router = APIRouter(
    prefix="/environments",
    tags=["Environment"]
)


# ============================================================
# CREATE ENVIRONMENT
# POST /environments/
# ============================================================

@router.post(
    "/",
    response_model=EnvironmentResponse
)
def add_environment(
    environment: EnvironmentCreate,
    db: Session = Depends(get_db)
):
    return create_environment(
        db,
        environment
    )


# ============================================================
# LIST ALL ENVIRONMENTS
# GET /environments/
# ============================================================

@router.get(
    "/",
    response_model=list[EnvironmentResponse]
)
def list_environments(
    db: Session = Depends(get_db)
):
    return get_all_environments(db)


# ============================================================
# GET SINGLE ENVIRONMENT
# GET /environments/{environment_id}
# ============================================================

@router.get(
    "/{environment_id}",
    response_model=EnvironmentResponse
)
def get_single_environment(
    environment_id: int,
    db: Session = Depends(get_db)
):
    environment = get_environment(
        db,
        environment_id
    )

    if not environment:
        raise HTTPException(
            status_code=404,
            detail="Environment not found"
        )

    return environment


# ============================================================
# UPDATE ENVIRONMENT
# PUT /environments/{environment_id}
# ============================================================

@router.put(
    "/{environment_id}",
    response_model=EnvironmentResponse
)
def edit_environment(
    environment_id: int,
    environment: EnvironmentCreate,
    db: Session = Depends(get_db)
):
    updated = update_environment(
        db,
        environment_id,
        environment
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Environment not found"
        )

    return updated


# ============================================================
# DELETE ENVIRONMENT
# DELETE /environments/{environment_id}
# ============================================================

@router.delete(
    "/{environment_id}"
)
def remove_environment(
    environment_id: int,
    db: Session = Depends(get_db)
):
    deleted = delete_environment(
        db,
        environment_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Environment not found"
        )

    return {
        "message": "Environment deleted successfully"
    }