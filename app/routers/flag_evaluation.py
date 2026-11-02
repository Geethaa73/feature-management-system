from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from app.database.connection import get_db
from app.models.environment import Environment
from app.models.feature_flag import FeatureFlag
from app.models.evaluation_log import EvaluationLog
from app.schemas.flag_evaluation import (
    FlagEvaluationRequest,
    FlagEvaluationResponse,
)
from app.services.evaluation_service import evaluate_feature
from app.services.redis_service import (
    get_cache,
    set_cache,
    build_evaluation_cache_key,
)
from app.dependencies.api_key import verify_sdk_api_key


router = APIRouter(
    prefix="/flags",
    tags=["Flag Evaluation"],
)


@router.post(
    "/evaluate",
    response_model=FlagEvaluationResponse,
)
def evaluate_flag_api(
    request: FlagEvaluationRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_sdk_api_key),
):
    # ============================================================
    # 1. FIND THE REQUESTED ENVIRONMENT
    # ============================================================

    environment = (
        db.query(Environment)
        .filter(
            Environment.name.ilike(
                request.environment.strip()
            )
        )
        .first()
    )

    if not environment:
        raise HTTPException(
            status_code=404,
            detail="Environment not found",
        )

    flag_key = request.flag_key.strip()

    # ============================================================
    # 2. FIND FEATURE FLAG
    # ============================================================

    feature = (
        db.query(FeatureFlag)
        .filter(
            FeatureFlag.key == flag_key
        )
        .first()
    )

    if not feature:
        raise HTTPException(
            status_code=404,
            detail="Feature flag not found",
        )

    # ============================================================
    # 3. BUILD REDIS CACHE KEY
    # ============================================================

    cache_key = build_evaluation_cache_key(
        flag_key=flag_key,
        user_id=request.user_id,
        environment=environment.name,
    )

    # ============================================================
    # 4. CHECK REDIS CACHE
    # ============================================================

    cached_result = get_cache(cache_key)

    if cached_result:

        response = json.loads(cached_result)

        # --------------------------------------------------------
        # Record the evaluation even when Redis serves the result.
        # This ensures analytics represent actual API usage.
        # --------------------------------------------------------

        evaluation_log = EvaluationLog(
            flag_id=feature.id,
            environment_id=environment.id,
            user_id=request.user_id,
            enabled=response["enabled"],
            reason=response["reason"],
        )

        db.add(evaluation_log)
        db.commit()

        return response

    # ============================================================
    # 5. CACHE MISS → EVALUATE FEATURE
    # ============================================================

    result = evaluate_feature(
        db=db,
        flag_key=flag_key,
        environment_id=environment.id,
        user_context={
            "user_id": request.user_id,
            "groups": request.groups,
        },
    )

    # ============================================================
    # 6. FEATURE DOES NOT EXIST
    # ============================================================

    if result["reason"] == "Feature not found":
        raise HTTPException(
            status_code=404,
            detail="Feature flag not found",
        )

    # ============================================================
    # 7. PREPARE API RESPONSE
    # ============================================================

    response = {
        "flag_key": flag_key,
        "enabled": result["enabled"],
        "reason": result["reason"],
    }

    # ============================================================
    # 8. RECORD EVALUATION
    # ============================================================

    evaluation_log = EvaluationLog(
        flag_id=feature.id,
        environment_id=environment.id,
        user_id=request.user_id,
        enabled=result["enabled"],
        reason=result["reason"],
    )

    db.add(evaluation_log)
    db.commit()

    # ============================================================
    # 9. STORE RESULT IN REDIS
    # ============================================================

    set_cache(
        cache_key,
        json.dumps(response),
        ttl=300,
    )

    # ============================================================
    # 10. RETURN RESULT
    # ============================================================

    return response