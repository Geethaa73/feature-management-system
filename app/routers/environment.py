from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.environment import EnvironmentCreate, EnvironmentResponse
from app.services.environment_service import (
    create_environment,
    get_all_environments,
)

router = APIRouter(
    prefix="/environments",
    tags=["Environment"]
)


@router.post("/", response_model=EnvironmentResponse)
def add_environment(
    environment: EnvironmentCreate,
    db: Session = Depends(get_db)
):
    return create_environment(db, environment)


@router.get("/", response_model=list[EnvironmentResponse])
def list_environments(
    db: Session = Depends(get_db)
):
    return get_all_environments(db)