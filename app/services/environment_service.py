from sqlalchemy.orm import Session
from app.models.environment import Environment
from app.schemas.environment import EnvironmentCreate


def create_environment(db: Session, environment: EnvironmentCreate):
    db_environment = Environment(
        name=environment.name,
        description=environment.description
    )

    db.add(db_environment)
    db.commit()
    db.refresh(db_environment)

    return db_environment


def get_all_environments(db: Session):
    return db.query(Environment).all()