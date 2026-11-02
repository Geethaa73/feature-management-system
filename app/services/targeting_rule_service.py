from sqlalchemy.orm import Session

from app.models.targeting_rule import TargetingRule
from app.models.feature_flag import FeatureFlag
from app.models.user import User
from app.models.group import Group
from app.schemas.targeting_rule import TargetingRuleCreate
from app.services.redis_service import delete_flag_cache
from app.services.audit_service import create_audit_log


def create_targeting_rule(
    db: Session,
    rule: TargetingRuleCreate,
    performed_by: str,
):
    # Check feature flag
    feature = (
        db.query(FeatureFlag)
        .filter(
            FeatureFlag.id == rule.feature_flag_id
        )
        .first()
    )

    if not feature:
        return None, "Feature flag not found"

    # Validate user targeting
    if rule.rule_type == "user":
        user = (
            db.query(User)
            .filter(
                User.username == rule.rule_value
            )
            .first()
        )

        if not user:
            return None, "User not found"

    # Validate group targeting
    if rule.rule_type == "group":
        group = (
            db.query(Group)
            .filter(
                Group.name == rule.rule_value
            )
            .first()
        )

        if not group:
            return None, "Group not found"

    # Prevent duplicate rule
    existing = (
        db.query(TargetingRule)
        .filter(
            TargetingRule.feature_flag_id == rule.feature_flag_id,
            TargetingRule.rule_type == rule.rule_type,
            TargetingRule.rule_value == rule.rule_value,
        )
        .first()
    )

    if existing:
        return existing, None

    db_rule = TargetingRule(
        feature_flag_id=rule.feature_flag_id,
        rule_type=rule.rule_type,
        rule_value=rule.rule_value,
    )

    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)

    # Clear cached evaluations because targeting changed
    delete_flag_cache(feature.key)

    # Record targeting change
    if rule.rule_type == "user":
        action = "USER_TARGET_ADDED"
    else:
        action = "GROUP_TARGET_ADDED"

    create_audit_log(
        db,
        action=action,
        performed_by=performed_by,
        flag_id=feature.id,
        environment_id=None,
        old_value=None,
        new_value=(
            f"Target type: {rule.rule_type}; "
            f"Target: {rule.rule_value}"
        ),
    )

    return db_rule, None


def get_targeting_rules(
    db: Session,
    feature_flag_id: int,
):
    return (
        db.query(TargetingRule)
        .filter(
            TargetingRule.feature_flag_id == feature_flag_id
        )
        .all()
    )


def get_targeting_rule(
    db: Session,
    rule_id: int,
):
    return (
        db.query(TargetingRule)
        .filter(
            TargetingRule.id == rule_id
        )
        .first()
    )


def delete_targeting_rule(
    db: Session,
    rule_id: int,
    performed_by: str,
):
    rule = get_targeting_rule(db, rule_id)

    if not rule:
        return None

    feature = (
        db.query(FeatureFlag)
        .filter(
            FeatureFlag.id == rule.feature_flag_id
        )
        .first()
    )

    # Store values before deletion
    rule_type = rule.rule_type
    rule_value = rule.rule_value
    feature_id = rule.feature_flag_id

    db.delete(rule)
    db.commit()

    # Clear cached evaluations because targeting changed
    if feature:
        delete_flag_cache(feature.key)

        if rule_type == "user":
            action = "USER_TARGET_REMOVED"
        else:
            action = "GROUP_TARGET_REMOVED"

        create_audit_log(
            db,
            action=action,
            performed_by=performed_by,
            flag_id=feature_id,
            environment_id=None,
            old_value=(
                f"Target type: {rule_type}; "
                f"Target: {rule_value}"
            ),
            new_value=None,
        )

    return rule