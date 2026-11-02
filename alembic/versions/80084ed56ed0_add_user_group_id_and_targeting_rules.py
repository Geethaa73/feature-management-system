"""add user group_id and targeting rules

Revision ID: 80084ed56ed0
Revises: 64a7b9a78c3b
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "80084ed56ed0"
down_revision: Union[str, Sequence[str], None] = "64a7b9a78c3b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add group_id to users
    op.add_column(
        "users",
        sa.Column(
            "group_id",
            sa.Integer(),
            nullable=True
        )
    )

    # Link users.group_id to groups.id
    op.create_foreign_key(
        "fk_users_group_id_groups",
        "users",
        "groups",
        ["group_id"],
        ["id"],
        ondelete="SET NULL"
    )

    # Create targeting rules table
    op.create_table(
        "targeting_rules",

        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            nullable=False
        ),

        sa.Column(
            "feature_flag_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "rule_type",
            sa.String(20),
            nullable=False
        ),

        sa.Column(
            "rule_value",
            sa.String(255),
            nullable=False
        ),

        sa.ForeignKeyConstraint(
            ["feature_flag_id"],
            ["feature_flags.id"],
            name="fk_targeting_rules_feature_flag_id",
            ondelete="CASCADE"
        )
    )

    op.create_index(
        "ix_targeting_rules_id",
        "targeting_rules",
        ["id"]
    )

    op.create_index(
        "ix_targeting_rules_feature_flag_id",
        "targeting_rules",
        ["feature_flag_id"]
    )


def downgrade() -> None:
    op.drop_index(
        "ix_targeting_rules_feature_flag_id",
        table_name="targeting_rules"
    )

    op.drop_index(
        "ix_targeting_rules_id",
        table_name="targeting_rules"
    )

    op.drop_table("targeting_rules")

    op.drop_constraint(
        "fk_users_group_id_groups",
        "users",
        type_="foreignkey"
    )

    op.drop_column(
        "users",
        "group_id"
    )
