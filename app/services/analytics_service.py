from datetime import datetime, timedelta, time, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.evaluation_log import EvaluationLog
from app.models.feature_flag import FeatureFlag
from app.models.environment import Environment
from app.models.audit_log import AuditLog


def get_flag_evaluation_counts(db: Session):
    """
    Return evaluation count for each feature flag.
    """

    results = (
        db.query(
            FeatureFlag.id.label("flag_id"),
            FeatureFlag.key.label("flag_key"),
            func.count(EvaluationLog.id).label("evaluation_count"),
        )
        .outerjoin(
            EvaluationLog,
            EvaluationLog.flag_id == FeatureFlag.id,
        )
        .group_by(
            FeatureFlag.id,
            FeatureFlag.key,
        )
        .order_by(
            func.count(EvaluationLog.id).desc()
        )
        .all()
    )

    return [
        {
            "flag_id": row.flag_id,
            "flag_key": row.flag_key,
            "evaluation_count": row.evaluation_count,
        }
        for row in results
    ]


def get_environment_usage(db: Session):
    """
    Return evaluation usage grouped by environment.
    """

    results = (
        db.query(
            Environment.id.label("environment_id"),
            Environment.name.label("environment"),
            func.count(EvaluationLog.id).label("evaluation_count"),
        )
        .outerjoin(
            EvaluationLog,
            EvaluationLog.environment_id == Environment.id,
        )
        .group_by(
            Environment.id,
            Environment.name,
        )
        .order_by(
            func.count(EvaluationLog.id).desc()
        )
        .all()
    )

    return [
        {
            "environment_id": row.environment_id,
            "environment": row.environment,
            "evaluation_count": row.evaluation_count,
        }
        for row in results
    ]


def _today_range():
    """
    Return today's UTC start and tomorrow's UTC start.
    """

    today = datetime.now(timezone.utc).date()

    start_of_day = datetime.combine(
        today,
        time.min,
        tzinfo=timezone.utc,
    )

    start_of_next_day = start_of_day + timedelta(days=1)

    return start_of_day, start_of_next_day


def get_today_evaluation_count(db: Session):
    """
    Return the number of feature evaluations recorded today.
    """

    start_of_day, start_of_next_day = _today_range()

    count = (
        db.query(func.count(EvaluationLog.id))
        .filter(
            EvaluationLog.timestamp >= start_of_day,
            EvaluationLog.timestamp < start_of_next_day,
        )
        .scalar()
    )

    return {
        "date": start_of_day.date().isoformat(),
        "today_evaluations": count or 0,
    }


def get_today_audit_log_count(db: Session):
    """
    Return the number of audit logs recorded today.
    """

    start_of_day, start_of_next_day = _today_range()

    count = (
        db.query(func.count(AuditLog.id))
        .filter(
            AuditLog.timestamp >= start_of_day,
            AuditLog.timestamp < start_of_next_day,
        )
        .scalar()
    )

    return {
        "date": start_of_day.date().isoformat(),
        "audit_logs_today": count or 0,
    }