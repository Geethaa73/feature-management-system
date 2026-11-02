from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.services.evaluation_service import evaluate_feature


router = APIRouter(
    prefix="/evaluate",
    tags=["Feature Evaluation"]
)


@router.get("/")
def evaluate(
    feature_name: str,
    user_id: int,
    environment_id: int,
    db: Session = Depends(get_db)
):

    return evaluate_feature(
        db=db,
        flag_key=feature_name,
        environment_id=environment_id,
        user_context={
            "user_id": user_id
        }
    )
