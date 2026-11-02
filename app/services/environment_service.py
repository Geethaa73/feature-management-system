
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

from app.models.environment import Environment
from app.schemas.environment import EnvironmentCreate


def create_environment(db: Session, environment: EnvironmentCreate):
    name = environment.name.strip()

    existing = db.query(Environment).filter(
        func.lower(Environment.name) == name.lower()
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Environment '{name}' already exists."
        )

    db_environment = Environment(
        name=name,
        description=environment.description
    )

    try:
        db.add(db_environment)
        db.commit()
        db.refresh(db_environment)
        return db_environment

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Environment '{name}' already exists."
        )


def get_all_environments(db: Session):
    return db.query(Environment).order_by(Environment.id).all()


def get_environment(db: Session, environment_id: int):
    return db.query(Environment).filter(
        Environment.id == environment_id
    ).first()


def update_environment(
    db: Session,
    environment_id: int,
    environment: EnvironmentCreate
):
    db_environment = get_environment(db, environment_id)

    if not db_environment:
        return None

    name = environment.name.strip()

    existing = db.query(Environment).filter(
        func.lower(Environment.name) == name.lower(),
        Environment.id != environment_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Environment '{name}' already exists."
        )

    db_environment.name = name
    db_environment.description = environment.description

    try:
        db.commit()
        db.refresh(db_environment)
        return db_environment

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Environment '{name}' already exists."
        )


def delete_environment(db: Session, environment_id: int):
    db_environment = get_environment(db, environment_id)

    if not db_environment:
        return None

    try:
        db.delete(db_environment)
        db.commit()
        return db_environment

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This environment cannot be deleted because it is being used by other records."
        )
