from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.services.analytics_service import (
    get_flag_evaluation_counts,
    get_environment_usage,
    get_today_evaluation_count,
    get_today_audit_log_count,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/flags")
def flag_analytics(
    db: Session = Depends(get_db),
):
    return get_flag_evaluation_counts(db)


@router.get("/usage")
def environment_usage_analytics(
    db: Session = Depends(get_db),
):
    return get_environment_usage(db)


@router.get("/today/evaluations")
def today_evaluation_analytics(
    db: Session = Depends(get_db),
):
    return get_today_evaluation_count(db)


@router.get("/today/audit-logs")
def today_audit_log_analytics(
    db: Session = Depends(get_db),
):
    return get_today_audit_log_count(db)