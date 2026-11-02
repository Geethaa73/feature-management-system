from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.targeting_rule import (
    TargetingRuleCreate,
    TargetingRuleResponse,
)

from app.services.targeting_rule_service import (
    create_targeting_rule,
    get_targeting_rules,
    delete_targeting_rule,
)

from app.auth.permissions import viewer_required


router = APIRouter(
    prefix="/targeting-rules",
    tags=["Targeting Rules"],
)


@router.post(
    "/",
    response_model=TargetingRuleResponse,
)
def add_targeting_rule(
    rule: TargetingRuleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(viewer_required),
):
    result, error = create_targeting_rule(
        db,
        rule,
        performed_by=current_user.email,
    )

    if error:
        raise HTTPException(
            status_code=404,
            detail=error,
        )

    return result


@router.get(
    "/flag/{feature_flag_id}",
    response_model=list[TargetingRuleResponse],
)
def list_targeting_rules(
    feature_flag_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(viewer_required),
):
    return get_targeting_rules(
        db,
        feature_flag_id,
    )


@router.delete(
    "/{rule_id}",
)
def remove_targeting_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(viewer_required),
):
    deleted = delete_targeting_rule(
        db,
        rule_id,
        performed_by=current_user.email,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Targeting rule not found",
        )

    return {
        "message": "Targeting rule deleted successfully"
    }
