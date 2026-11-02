from sqlalchemy.orm import Session
import hashlib

from app.models.feature_flag import FeatureFlag
from app.models.user_group import UserGroup
from app.models.override import EnvironmentOverride
from app.models.targeting_rule import TargetingRule
from app.models.user import User
from app.models.group import Group


def evaluate_feature(
    db: Session,
    flag_key: str,
    environment_id: int,
    user_context: dict
):
    # ============================================================
    # 1. FIND FEATURE FLAG
    # ============================================================

    feature = (
        db.query(FeatureFlag)
        .filter(FeatureFlag.key == flag_key)
        .first()
    )

    if not feature:
        return {
            "feature": flag_key,
            "enabled": False,
            "reason": "Feature not found",
            "bucket": None,
            "rollout_percentage": None
        }

    user_id = user_context.get("user_id")
    request_groups = user_context.get("groups", [])

    # ============================================================
    # 2. ENVIRONMENT OVERRIDE
    # ============================================================

    override = (
        db.query(EnvironmentOverride)
        .filter(
            EnvironmentOverride.flag_id == feature.id,
            EnvironmentOverride.environment_id == environment_id
        )
        .first()
    )

    if override:
        return {
            "feature": flag_key,
            "enabled": override.value,
            "reason": "environment_override",
            "bucket": None,
            "rollout_percentage": feature.rollout_percentage
        }

    # ============================================================
    # 3. CHECK WHETHER FEATURE IS ENABLED
    # ============================================================

    if not feature.enabled:
        return {
            "feature": flag_key,
            "enabled": False,
            "reason": "default_value",
            "bucket": None,
            "rollout_percentage": feature.rollout_percentage
        }

    # ============================================================
    # 4. USER TARGETING
    # ============================================================

    targeting_rules = (
        db.query(TargetingRule)
        .filter(
            TargetingRule.feature_flag_id == feature.id
        )
        .all()
    )

    user_rules = [
        rule
        for rule in targeting_rules
        if rule.rule_type == "user"
    ]

    group_rules = [
        rule
        for rule in targeting_rules
        if rule.rule_type == "group"
    ]

    # ------------------------------------------------------------
    # 4A. DIRECT USER TARGET
    # ------------------------------------------------------------

    if user_id is not None and user_rules:

        user = (
            db.query(User)
            .filter(User.username == user_id)
            .first()
        )

        if user:

            for rule in user_rules:

                if user.username == rule.rule_value:

                    return {
                        "feature": flag_key,
                        "enabled": True,
                        "reason": "user_targeting",
                        "bucket": None,
                        "rollout_percentage": feature.rollout_percentage
                    }

    # ============================================================
    # 5. GROUP TARGETING
    # ============================================================

    if group_rules and request_groups:

        requested_groups = {
            group.strip()
            for group in request_groups
            if group and group.strip()
        }

        for rule in group_rules:

            if rule.rule_value in requested_groups:

                return {
                    "feature": flag_key,
                    "enabled": True,
                    "reason": "group_targeting",
                    "bucket": None,
                    "rollout_percentage": feature.rollout_percentage
                }

    # ============================================================
    # 6. EXISTING DATABASE GROUP MEMBERSHIP
    # ============================================================

    if group_rules and user_id is not None:

        user = (
            db.query(User)
            .filter(User.username == user_id)
            .first()
        )

        if user:

            user_group_ids = {
                membership.group_id
                for membership in (
                    db.query(UserGroup)
                    .filter(
                        UserGroup.user_id == user.id
                    )
                    .all()
                )
            }

            for rule in group_rules:

                group = (
                    db.query(Group)
                    .filter(
                        Group.name == rule.rule_value
                    )
                    .first()
                )

                if group and group.id in user_group_ids:

                    return {
                        "feature": flag_key,
                        "enabled": True,
                        "reason": "group_targeting",
                        "bucket": None,
                        "rollout_percentage": feature.rollout_percentage
                    }

    # ============================================================
    # 7. EXISTING target_group_id SUPPORT
    # ============================================================

    if feature.target_group_id:

        user = None

        if user_id is not None:

            user = (
                db.query(User)
                .filter(
                    User.username == user_id
                )
                .first()
            )

        if user:

            assignment = (
                db.query(UserGroup)
                .filter(
                    UserGroup.user_id == user.id,
                    UserGroup.group_id == feature.target_group_id
                )
                .first()
            )

            if assignment:

                return {
                    "feature": flag_key,
                    "enabled": True,
                    "reason": "group_targeting",
                    "bucket": None,
                    "rollout_percentage": feature.rollout_percentage
                }

    # ============================================================
    # 8. PERCENTAGE ROLLOUT
    # ============================================================

    # A deterministic bucket is generated from the user
    # and feature key.
    #
    # Example:
    # user_999 + new_dashboard
    #        ↓
    # deterministic hash
    #        ↓
    # bucket 12
    #
    # For 20% rollout:
    # buckets 0-19 = included

    if user_id is not None:

        hash_input = f"{user_id}:{flag_key}"

        user_hash = int(
            hashlib.md5(
                hash_input.encode()
            ).hexdigest(),
            16
        )

        bucket = user_hash % 100

        if bucket < feature.rollout_percentage:

            return {
                "feature": flag_key,
                "enabled": True,
                "reason": "percentage_rollout",
                "bucket": bucket,
                "rollout_percentage": feature.rollout_percentage
            }

        return {
            "feature": flag_key,
            "enabled": False,
            "reason": "default_value",
            "bucket": bucket,
            "rollout_percentage": feature.rollout_percentage
        }

    # ============================================================
    # 9. DEFAULT VALUE
    # ============================================================

    return {
        "feature": flag_key,
        "enabled": feature.default_value,
        "reason": "default_value",
        "bucket": None,
        "rollout_percentage": feature.rollout_percentage
    }